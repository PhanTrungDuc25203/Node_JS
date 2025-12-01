import { resolveInclude } from "ejs";
import db from "../models/index";
import bcrypt from "bcryptjs";
require("dotenv").config();
import _ from "lodash";
import sendPaymentEmailService from "./sendPaymentEmailService";
import moment from "moment";

const MAX_NUMBER_CAN_RENDEZVOUS_DOCTOR = process.env.MAX_NUMBER_CAN_RENDEZVOUS_DOCTOR;

let getEliteDoctorForHomePage = (limitEliteDoctor) => {
    return new Promise(async (resolve, reject) => {
        try {
            let doctors = await db.User.findAll({
                limit: limitEliteDoctor,
                where: {
                    roleId: "R2",
                },
                order: [["createdAt", "DESC"]],
                attributes: {
                    exclude: ["password"],
                },
                include: [
                    { model: db.Allcode, as: "positionData", attributes: ["value_Eng", "value_Vie"] },
                    { model: db.Allcode, as: "genderData", attributes: ["value_Eng", "value_Vie"] },
                ],
                raw: true,
                nest: true,
            });
            resolve({
                errCode: 0,
                data: doctors,
            });
        } catch (e) {
            reject(e);
        }
    });
};

let getAllDoctorsForDoctorArticlePage = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let doctors = await db.User.findAll({
                where: { roleId: "R2" },
                attributes: {
                    exclude: ["password", "image"],
                },
            });
            resolve({
                errCode: 0,
                data: doctors,
            });
        } catch (e) {
            reject(e);
        }
    });
};

let checkRequiredField = (inputData) => {
    let arrFields = ["doctorId", "htmlContent", "markdownContent", "action", "selectedPrice", "selectedPaymentMethod", "selectedProvince", "note", "specialtyId", "selectedMedicalFacility"];
    let isValid = true;
    let element = "";
    for (let i = 0; i < arrFields.length; i++) {
        if (!inputData[arrFields[i]]) {
            isValid = false;
            element = arrFields[i];
            break;
        }
    }
    return {
        isValid: isValid,
        element: element,
    };
};

let saveInforAndArticleOfADoctorService = (inputData) => {
    return new Promise(async (resolve, reject) => {
        try {
            let checkObj = checkRequiredField(inputData);
            if (checkObj.isValid === false) {
                resolve({
                    errCode: 1,
                    errMesage: "Missing parameters!",
                });
            } else {
                //upsert to Markdown
                if (inputData.action === "CREATE") {
                    await db.ArticleMarkdown.create({
                        htmlContent: inputData.htmlContent,
                        markdownContent: inputData.markdownContent,
                        description: inputData.description,
                        doctorId: inputData.doctorId,
                    });
                } else if (inputData.action === "EDIT") {
                    let needEdittingDoctorArticle = await db.ArticleMarkdown.findOne({
                        where: { doctorId: inputData.doctorId },
                        raw: false,
                    });
                    if (needEdittingDoctorArticle) {
                        needEdittingDoctorArticle.htmlContent = inputData.htmlContent;
                        needEdittingDoctorArticle.markdownContent = inputData.markdownContent;
                        needEdittingDoctorArticle.description = inputData.description;
                        await needEdittingDoctorArticle.save();
                    }
                }

                //upsert to Doctor_infor table in DB
                let doctorInfor = await db.Doctor_infor.findOne({
                    where: { doctorId: inputData.doctorId },
                    raw: false,
                });
                if (doctorInfor) {
                    //update
                    doctorInfor.doctorId = inputData.doctorId;
                    doctorInfor.priceId = inputData.selectedPrice;
                    doctorInfor.provinceId = inputData.selectedProvince;
                    doctorInfor.paymentId = inputData.selectedPaymentMethod;
                    doctorInfor.clinicAddress = inputData.clinicAddress;
                    doctorInfor.clinicName = inputData.clinicName;
                    doctorInfor.note = inputData.note;
                    doctorInfor.specialtyId = inputData.specialtyId;
                    doctorInfor.clinicId = inputData.clinicId;
                    await doctorInfor.save();
                } else {
                    //create
                    await db.Doctor_infor.create({
                        doctorId: inputData.doctorId,
                        priceId: inputData.selectedPrice,
                        provinceId: inputData.selectedProvince,
                        paymentId: inputData.selectedPaymentMethod,
                        clinicAddress: inputData.clinicAddress,
                        clinicName: inputData.clinicName,
                        note: inputData.note,
                        specialtyId: inputData.specialtyId,
                        clinicId: inputData.clinicId,
                    });
                }

                if (inputData.selectedMedicalFacility) {
                    if (inputData.action === "CREATE") {
                        // Tạo mới bản ghi
                        await db.Doctor_specialty_medicalFacility.create({
                            doctorId: inputData.doctorId,
                            specialtyId: inputData.specialtyId,
                            medicalFacilityId: inputData.selectedMedicalFacility,
                        });
                    } else if (inputData.action === "EDIT") {
                        // Tìm và cập nhật bản ghi
                        let doctorMedicalFacility = await db.Doctor_specialty_medicalFacility.findOne({
                            where: {
                                doctorId: inputData.doctorId,
                                specialtyId: inputData.specialtyId,
                            },
                            raw: false,
                        });
                        if (doctorMedicalFacility) {
                            doctorMedicalFacility.medicalFacilityId = inputData.selectedMedicalFacility;
                            await doctorMedicalFacility.save();
                        } else {
                            // Nếu không tìm thấy, tạo mới bản ghi
                            await db.Doctor_specialty_medicalFacility.create({
                                doctorId: inputData.doctorId,
                                specialtyId: inputData.specialtyId,
                                medicalFacilityId: inputData.selectedMedicalFacility,
                            });
                        }
                    }
                }

                resolve({
                    errCode: 0,
                    errMessage: "Save article for doctor successfully!",
                });
            }
        } catch (e) {
            reject(e);
        }
    });
};

let getParticularInforForDoctorPage = (inputDoctorId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!inputDoctorId) {
                resolve({
                    errCode: 1,
                    errMessage: "Missing required parameter(s)!",
                });
            } else {
                let data = await db.User.findOne({
                    where: {
                        id: inputDoctorId,
                    },
                    attributes: {
                        exclude: ["password"],
                    },
                    include: [
                        { model: db.ArticleMarkdown, attributes: ["htmlContent", "markdownContent", "description"] },
                        { model: db.Allcode, as: "positionData", attributes: ["value_Eng", "value_Vie"] },

                        {
                            model: db.Doctor_infor,
                            attributes: {
                                exclude: ["id", "doctorId"],
                            },
                            include: [
                                { model: db.Allcode, as: "priceTypeData", attributes: ["value_Eng", "value_Vie"] },
                                { model: db.Allcode, as: "provinceTypeData", attributes: ["value_Eng", "value_Vie"] },
                                { model: db.Allcode, as: "paymentTypeData", attributes: ["value_Eng", "value_Vie"] },
                                { model: db.Specialty, as: "belongToSpecialty", attributes: ["name"] },
                            ],
                        },
                        {
                            model: db.Doctor_specialty_medicalFacility,
                            attributes: {
                                exclude: ["id", "createdAt", "updatedAt"],
                            },
                            include: [
                                {
                                    model: db.ComplexMedicalFacility,
                                    as: "medicalFacilityDoctorAndSpecialty",
                                    attributes: ["id", "name"],
                                },
                            ],
                        },
                    ],
                    raw: false,
                    nest: true,
                });

                if (data && data.image) {
                    data.image = Buffer.from(data.image, "base64").toString("binary");
                }

                if (!data) data = {};

                resolve({
                    errCode: 0,
                    data: data,
                });
            }
        } catch (e) {
            reject(e);
        }
    });
};

let bulkCreateTimeframesForDoctorService = (inputData) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!inputData.scheduleArr || !inputData.doctorId || !inputData.formatedDate) {
                resolve({
                    errCode: 1,
                    errMessage: "Missing required parameters: timeframe data!",
                });
            } else {
                let availableTimeframe = inputData.scheduleArr;
                if (availableTimeframe && availableTimeframe.length > 0) {
                    availableTimeframe.map((item) => {
                        item.maxNumber = MAX_NUMBER_CAN_RENDEZVOUS_DOCTOR;
                        return item;
                    });
                }

                //kiểm tra timeframe của một bác sĩ đã tồn tại
                let existing = await db.Schedule.findAll({
                    where: { doctorId: inputData.doctorId, date: inputData.formatedDate },
                    attributes: ["timeType", "date", "doctorId", "maxNumber"],
                    raw: true,
                });

                if (existing && existing.length > 0) {
                    existing = existing.map((item) => {
                        item.date = new Date(item.date).getTime();
                        return item;
                    });
                }

                //compare to find differences
                let needAdding = _.differenceWith(availableTimeframe, existing, (a, b) => {
                    return a.timeType === b.timeType && a.date === b.date;
                });

                //create
                if (needAdding && needAdding.length > 0) {
                    await db.Schedule.bulkCreate(needAdding);
                }

                // console.log('Timeframe for doctor: ', availableTimeframe);
                // await db.Schedule.bulkCreate(availableTimeframe);
                resolve({
                    errCode: 0,
                    errMessage: "Create available time for doctor appointment successfully!",
                });
            }
        } catch (e) {
            reject(e);
        }
    });
};

let getScheduleByDateService = (doctorId, date) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!doctorId || !date) {
                resolve({
                    errCode: 1,
                    errMessage: "Missing required parameter: doctorId or date!",
                });
            } else {
                // let formattedDate = moment(Number(date)).format('YYYY-MM-DD 00:00:00');
                console.log("Check formatted date: ", date, "type of date: ", typeof date);
                let numberDate = Number(date);
                console.log("Check formatted date (number): ", numberDate, "type of date: ", typeof numberDate);

                let scheduleData = await db.Schedule.findAll({
                    where: {
                        doctorId: doctorId,
                        date: numberDate,
                    },
                    include: [{ model: db.Allcode, as: "timeTypeData", attributes: ["value_Eng", "value_Vie"] }],
                    raw: false,
                    nest: true,
                });

                let bookedSchedule = await db.Booking.findAll({
                    where: {
                        doctorId: doctorId,
                        date: numberDate,
                        statusId: "S2",
                    },
                    attributes: {
                        exclude: ["patientPhoneNumber", "patientBirthday", "patientAddress", "patientGender", "examReason", "createdAt", "updatedAt"],
                    },
                });

                console.log("Check schedule data: ", scheduleData);
                if (!scheduleData) {
                    scheduleData = ["no schedule"];
                }

                resolve({
                    errCode: 0,
                    errMessage: "Get doctor schedule successfully!",
                    data: scheduleData,
                    bookedSchedule: bookedSchedule,
                });
            }
        } catch (e) {}
    });
};

let getExtraInforDoctorByIDService = (inputId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!inputId) {
                resolve({
                    errCode: 1,
                    errMessage: "Missing input parameter: doctorId",
                });
            } else {
                let data = await db.Doctor_infor.findOne({
                    where: { doctorId: inputId },
                    attributes: {
                        exclude: ["id", "doctorId"],
                    },
                    include: [
                        { model: db.Allcode, as: "priceTypeData", attributes: ["value_Eng", "value_Vie"] },
                        { model: db.Allcode, as: "provinceTypeData", attributes: ["value_Eng", "value_Vie"] },
                        { model: db.Allcode, as: "paymentTypeData", attributes: ["value_Eng", "value_Vie"] },
                    ],
                    raw: false,
                    nest: true,
                });
                if (!data) {
                    data = {};
                }
                resolve({
                    errCode: 0,
                    data: data,
                });
            }
        } catch (e) {
            reject(e);
        }
    });
};

let saveAppointmentHistoryService = (inputData) => {
    return new Promise(async (resolve, reject) => {
        try {
            console.log("Check data: ", inputData);

            // Kiểm tra các tham số bắt buộc
            if (!inputData.appointmentId || !inputData.patientEmail || !inputData.doctorEmail || !inputData.description || !inputData.files || !inputData.appointmentDate || !inputData.appointmentTimeFrame) {
                resolve({
                    errCode: 1,
                    errMessage: "Missing required parameters!",
                });
                return;
            }

            // 🔹 Lấy thông tin booking hiện tại để kiểm tra trạng thái
            let booking = await db.Booking.findOne({
                where: { id: inputData.appointmentId },
                include: [
                    {
                        model: db.User,
                        as: "doctorHasAppointmentWithPatients",
                        attributes: ["id", "firstName", "lastName", "address", "phoneNumber"],
                        include: [
                            {
                                model: db.Doctor_infor,
                                attributes: {
                                    exclude: ["id", "doctorId", "provinceId", "specialtyId", "clinicId", "note", "count"],
                                },
                                include: [
                                    {
                                        model: db.Allcode,
                                        as: "priceTypeData",
                                        attributes: ["value_Eng", "value_Vie"],
                                    },
                                ],
                            },
                        ],
                    },
                ],
                raw: false,
            });

            if (!booking) {
                resolve({
                    errCode: 2,
                    errMessage: "Appointment not found!",
                });
                return;
            }

            // 🔹 Cập nhật trạng thái tùy theo type
            if (inputData.type === "done-confirm") {
                booking.statusId = "S3";
                if (inputData.files) {
                    let fileBuffer = Buffer.from(inputData.files, "base64");
                    booking.files = fileBuffer;
                }
                await booking.save();
            }

            if (inputData.type === "cash-confirm") {
                booking.paymentStatus = "PT3";
                booking.paidAmount = +booking?.doctorHasAppointmentWithPatients?.Doctor_infor?.priceTypeData?.value_Vie;
                if (inputData.files) {
                    let fileBuffer = Buffer.from(inputData.files, "base64");
                    booking.files = fileBuffer;
                }
                await booking.save();
            }

            resolve({
                errCode: 0,
                errMessage: "Save appointment history successfully!",
            });
        } catch (e) {
            reject(e);
        }
    });
};

let buildUrlPostVisitPaymentPage = (doctorId, token) => {
    let result = `${process.env.URL_REACT_SERVER}/post-visit-payment?token=${token}&doctorId=${doctorId}`;
    return result;
};

let confirmAppointmentDoneService = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.appointmentId) {
                resolve({
                    errCode: 1,
                    errMessage: "Missing appointmentId parameters!",
                });
            } else {
                if (data.type === "done-confirm") {
                    let appointment = await db.Booking.findOne({
                        where: {
                            id: data.appointmentId,
                            statusId: "S2",
                        },
                        include: [
                            {
                                model: db.Allcode,
                                as: "appointmentTimeTypeData",
                                attributes: ["value_Vie", "value_Eng"],
                            },
                        ],
                    });

                    if (appointment) {
                        appointment.statusId = "S3";
                        if (data.files) {
                            let fileBuffer = Buffer.from(data.files, "base64");
                            appointment.files = fileBuffer;
                        }
                        await appointment.save();
                    }
                    if (appointment.paymentMethod === "PM2") {
                        let patientInfo = await db.User.findOne({
                            where: {
                                id: appointment.patientId,
                            },
                            attributes: {
                                exclude: ["password", "createdAt", "updatedAt", "address", "gender", "phoneNumber", "image", "roleId", "positionId"],
                            },
                        });
                        let doctorInfo = await db.User.findOne({
                            where: {
                                id: appointment.doctorId,
                            },
                            include: [
                                { model: db.Allcode, as: "positionData", attributes: ["value_Eng", "value_Vie"] },
                                {
                                    model: db.Doctor_infor,
                                    attributes: {
                                        exclude: ["id", "doctorId"],
                                    },
                                },
                            ],
                        });
                        let redirectLink = buildUrlPostVisitPaymentPage(appointment.doctorId, appointment.token);
                        let appointmentMoment = "";
                        let date = moment(appointment.date).format("DD/MM/YYYY"); // 07/10/2024
                        let time = appointment.appointmentTimeTypeData.value_Vie; // 14:00 - 15:00 (hoặc value_Eng nếu cần)
                        appointmentMoment = `${time}, ${date}`;
                        await sendPaymentEmailService.sendAEmail({
                            receiverEmail: patientInfo.email,
                            patientName: patientInfo.lastName + " " + patientInfo.firstName,
                            time: appointmentMoment,
                            doctorName: doctorInfo.lastName + " " + doctorInfo.firstName,
                            clinicAddress: doctorInfo.Doctor_infor.clinicAddress,
                            language: data.language,
                            redirectLink: redirectLink,
                            language: "vi",
                        });
                    }

                    resolve({
                        errCode: 0,
                        errMessage: "Save appointment history successfully!",
                    });
                }
                if (data.type === "cash-confirm") {
                    let appointment = await db.Booking.findOne({
                        where: {
                            id: data.appointmentId,
                            statusId: "S2",
                        },
                        include: [
                            {
                                model: db.User,
                                as: "doctorHasAppointmentWithPatients",
                                attributes: ["id", "firstName", "lastName", "address", "phoneNumber"],
                                include: [
                                    {
                                        model: db.Doctor_infor,
                                        attributes: {
                                            exclude: ["id", "doctorId", "provinceId", "specialtyId", "clinicId", "note", "count"],
                                        },
                                        include: [
                                            {
                                                model: db.Allcode,
                                                as: "priceTypeData",
                                                attributes: ["value_Eng", "value_Vie"],
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    });

                    if (appointment) {
                        appointment.paymentStatus = "PT3";
                        appointment.paidAmount = +appointment?.doctorHasAppointmentWithPatients?.Doctor_infor?.priceTypeData?.value_Vie;
                        await appointment.save();
                    }

                    resolve({
                        errCode: 0,
                        errMessage: "Save appointment history successfully!",
                    });
                }
            }
        } catch (e) {
            reject(e);
        }
    });
};

let handlePostVisitPaymentMethodService = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            console.log("check data: ", data);
            if (!data || !data.token || !data.doctorId || !data.paidAmount) {
                resolve({
                    errCode: 1,
                    errMessage: `Missing required parameters: token || doctorId || paidAmount!`,
                });
            } else {
                let booking = await db.Booking.findOne({
                    where: { token: data.token },
                    include: [
                        {
                            model: db.User,
                            as: "doctorHasAppointmentWithPatients",
                            attributes: ["id", "firstName", "lastName", "address", "phoneNumber", "email"],
                            include: [
                                {
                                    model: db.Doctor_infor,
                                    attributes: {
                                        exclude: ["id", "doctorId", "provinceId", "specialtyId", "clinicId", "note", "count"],
                                    },
                                    include: [
                                        {
                                            model: db.Allcode,
                                            as: "priceTypeData",
                                            attributes: ["value_Eng", "value_Vie"],
                                        },
                                    ],
                                },
                            ],
                        },
                        {
                            model: db.User,
                            as: "patientHasAppointmentWithDoctors",
                            attributes: ["id", "firstName", "lastName", "address", "phoneNumber", "email"],
                        },
                    ],
                    raw: false,
                });

                if (booking) {
                    booking.paymentStatus = "PT3";
                    booking.paidAmount = +data.paidAmount / 100;
                    await booking.save();
                }

                resolve({
                    errCode: 0,
                    errMessage: "Get appointment histories successfully!",
                });
            }
        } catch (e) {
            reject(e);
        }
    });
};

let getAppointmentHistoriesByDoctorEmailService = (inputDoctorEmail) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!inputDoctorEmail) {
                resolve({
                    errCode: 1,
                    errMessage: `Missing required parameters: doctor's email!`,
                });
            } else {
                let user = await db.User.findOne({
                    where: {
                        email: inputDoctorEmail,
                    },
                    attributes: {
                        exclude: ["createdAt", "updatedAt", "image"],
                    },
                });
                if (user) {
                    let data = await db.Booking.findAll({
                        where: {
                            doctorId: user.id,
                            statusId: "S3",
                            paymentStatus: "PT3",
                        },
                        include: [
                            {
                                model: db.Allcode,
                                as: "appointmentTimeTypeData",
                                attributes: ["value_Vie", "value_Eng"],
                            },
                            {
                                model: db.User,
                                as: "patientHasAppointmentWithDoctors",
                                attributes: ["id", "firstName", "lastName", "address", "phoneNumber", "email"],
                            },
                        ],
                        attributes: {
                            exclude: ["createdAt", "updatedAt"],
                        },
                        raw: false,
                    });
                    if (!data) {
                        data = {};
                    }

                    resolve({
                        data: data,
                        errCode: 0,
                        errMessage: "Get appointment histories successfully!",
                    });
                } else {
                    resolve({
                        errCode: 1,
                        errMessage: "User not found!",
                    });
                }
            }
        } catch (e) {
            reject(e);
        }
    });
};

let saveClinicalReportContentToDatabaseService = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const { base64File, appointmentId } = data; // ✅ bóc dữ liệu ra

            if (!base64File || !appointmentId) {
                return resolve({
                    errCode: 1,
                    errMessage: "Missing required parameters!",
                });
            }

            // 🔹 Mã hóa base64 -> Buffer để lưu vào BLOB
            const fileBuffer = Buffer.from(base64File, "base64");

            // 🔹 Cập nhật DB
            const [updated] = await db.Booking.update({ files: fileBuffer }, { where: { id: appointmentId } });

            if (updated === 0) {
                return resolve({
                    errCode: 2,
                    errMessage: "Appointment not found!",
                });
            }

            return resolve({
                errCode: 0,
                errMessage: "File saved successfully!",
            });
        } catch (e) {
            console.error("❌ Service error:", e);
            return reject(e);
        }
    });
};

module.exports = {
    getEliteDoctorForHomePage: getEliteDoctorForHomePage,
    getAllDoctorsForDoctorArticlePage: getAllDoctorsForDoctorArticlePage,
    saveInforAndArticleOfADoctorService: saveInforAndArticleOfADoctorService,
    getParticularInforForDoctorPage: getParticularInforForDoctorPage,
    bulkCreateTimeframesForDoctorService: bulkCreateTimeframesForDoctorService,
    getScheduleByDateService: getScheduleByDateService,
    getExtraInforDoctorByIDService: getExtraInforDoctorByIDService,
    saveAppointmentHistoryService: saveAppointmentHistoryService,
    confirmAppointmentDoneService: confirmAppointmentDoneService,
    getAppointmentHistoriesByDoctorEmailService: getAppointmentHistoriesByDoctorEmailService,
    handlePostVisitPaymentMethodService: handlePostVisitPaymentMethodService,
    saveClinicalReportContentToDatabaseService: saveClinicalReportContentToDatabaseService,
};
