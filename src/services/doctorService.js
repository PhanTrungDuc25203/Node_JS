import { resolveInclude } from "ejs";
import db from "../models/index";
import bcrypt from "bcryptjs";
import { Op } from "sequelize";
require("dotenv").config();
import _ from "lodash";
import sendPaymentEmailService from "./sendPaymentEmailService";
import sendMedicalReportService from "./sendMedicalReportService";
import moment from "moment";

const MAX_NUMBER_CAN_RENDEZVOUS_DOCTOR = process.env.MAX_NUMBER_CAN_RENDEZVOUS_DOCTOR;

let getEliteDoctorForHomePage = (limitEliteDoctor) => {
    return new Promise(async (resolve, reject) => {
        try {
            let doctors = await db.User.findAll({
                limit: limitEliteDoctor,
                where: {
                    roleId: "R2",
                    positionId: { [Op.ne]: "P5" },
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
                let doctor = await db.User.findOne({
                    where: { id: inputData.doctorId },
                    attributes: {
                        exclude: ["password", "image"],
                    },
                });

                if (doctor && doctor.positionId === "P5" && doctor.roleId === "R2") {
                    await db.MedicalFacility_staff.create({
                        staffId: inputData.doctorId,
                        specialtyId: inputData.specialtyId,
                        medicalFacilityId: inputData.selectedMedicalFacility,
                    });

                    resolve({
                        errCode: 0,
                        errMessage: "Save role for nurse / staff successfully!",
                    });
                }
                if (doctor && doctor.positionId !== "P5" && doctor.roleId === "R2") {
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
                                    attributes: ["id", "name", "address"],
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
                let numberDate = Number(date);

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
                let doctorInfor = await db.User.findOne({
                    where: { id: inputId },
                    attributes: {
                        exclude: ["id", "email", "password", "address", "phoneNumber", "roleId", "positionId"],
                    },
                    include: [
                        { model: db.ArticleMarkdown, attributes: ["htmlContent", "markdownContent", "description"] },
                        { model: db.Allcode, as: "positionData", attributes: ["value_Eng", "value_Vie"] },
                        {
                            model: db.Doctor_infor,
                            attributes: { exclude: ["id", "doctorId"] },
                            include: [
                                { model: db.Allcode, as: "priceTypeData", attributes: ["value_Eng", "value_Vie"] },
                                { model: db.Allcode, as: "provinceTypeData", attributes: ["value_Eng", "value_Vie"] },
                                { model: db.Allcode, as: "paymentTypeData", attributes: ["value_Eng", "value_Vie"] },
                                { model: db.Specialty, as: "belongToSpecialty", attributes: ["name"] },
                            ],
                        },
                        {
                            model: db.Doctor_specialty_medicalFacility,
                            attributes: { exclude: ["id", "createdAt", "updatedAt"] },
                            include: [
                                {
                                    model: db.ComplexMedicalFacility,
                                    as: "medicalFacilityDoctorAndSpecialty",
                                    attributes: ["id", "name", "address"],
                                },
                            ],
                        },
                    ],
                });
                if (!data) {
                    data = {};
                }
                if (doctorInfor?.Doctor_specialty_medicalFacility?.medicalFacilityDoctorAndSpecialty) {
                    data.dataValues.workPlace = {
                        hospitalId: doctorInfor.Doctor_specialty_medicalFacility.medicalFacilityDoctorAndSpecialty.id,
                        hospitalName: doctorInfor.Doctor_specialty_medicalFacility.medicalFacilityDoctorAndSpecialty.name,
                        hospitalAddress: doctorInfor.Doctor_specialty_medicalFacility.medicalFacilityDoctorAndSpecialty.address,
                    };
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
            if (!inputData.appointmentId || !inputData.patientEmail || !inputData.doctorEmail || !inputData.description || !inputData.files || !inputData.appointmentDate || !inputData.appointmentTimeFrame) {
                resolve({
                    errCode: 1,
                    errMessage: "Missing required parameters!",
                });
                return;
            }

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
                raw: false,
            });

            if (!booking) {
                resolve({
                    errCode: 2,
                    errMessage: "Appointment not found!",
                });
                return;
            }

            if (inputData.type === "done-confirm") {
                booking.statusId = "S3";
                if (inputData.files) {
                    let fileBuffer = Buffer.from(inputData.files, "base64");
                    booking.files = fileBuffer;
                }
                let sendEmailRes = await sendMedicalReportService.sendMedicalReportToPatient({
                    examType: "doctorAppointment",
                    receiverEmail: inputData.patientEmail,
                    patientName: `${booking.patientHasAppointmentWithDoctors.lastName} ${booking.patientHasAppointmentWithDoctors.firstName}`,
                    doctorName: `${booking.doctorHasAppointmentWithPatients.lastName} ${booking.doctorHasAppointmentWithPatients.firstName}`,
                    appointmentDate: inputData.appointmentDate,
                    appointmentTimeFrame: inputData.appointmentTimeFrame,
                    medicalReport: inputData.files,
                });
                console.log("Send email response: ", sendEmailRes);
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
                            {
                                model: db.User,
                                as: "patientHasAppointmentWithDoctors",
                                attributes: ["id", "firstName", "lastName", "address", "phoneNumber", "email"],
                            },
                            {
                                model: db.User,
                                as: "doctorHasAppointmentWithPatients",
                                attributes: ["id", "firstName", "lastName", "address", "phoneNumber", "email"],
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
                    if (appointment.paymentMethod === "PM3") {
                        let sendEmailRes = await sendMedicalReportService.sendMedicalReportToPatient({
                            examType: "doctorAppointment",
                            receiverEmail: appointment.patientHasAppointmentWithDoctors.email,
                            patientName: `${appointment.patientHasAppointmentWithDoctors.lastName} ${appointment.patientHasAppointmentWithDoctors.firstName}`,
                            doctorName: `${appointment.doctorHasAppointmentWithPatients.lastName} ${appointment.doctorHasAppointmentWithPatients.firstName}`,
                            appointmentDate: data.appointmentDate,
                            appointmentTimeFrame: appointment.appointmentTimeTypeData.value_Vie,
                            medicalReport: appointment.files,
                        });
                        console.log("Check send email response: ", sendEmailRes);
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
                            medicalReport: appointment.files,
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

let getDoctorAppointmentsTodayOverviewStatisticsService = (doctorId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!doctorId) {
                return resolve({
                    errCode: 1,
                    errMessage: "Missing required parameter doctorId!",
                });
            }

            let today = moment().format("YYYY-MM-DD");

            let totalPatients = await db.Booking.count({
                where: {
                    doctorId: doctorId,
                    // statusId: "S3",
                },
                distinct: true,
                col: "patientId",
            });

            let todayAppointments = await db.Booking.count({
                where: {
                    doctorId: doctorId,
                    date: today,
                },
            });

            let completedToday = await db.Booking.count({
                where: {
                    doctorId: doctorId,
                    date: today,
                    statusId: "S3",
                },
            });

            // 4️⃣ Số lịch hẹn hôm nay chưa hoàn thành (Booked + Confirmed)
            let pendingAppointments = await db.Booking.count({
                where: {
                    doctorId: doctorId,
                    date: today,
                    statusId: { [Op.in]: ["S2"] },
                },
            });

            let doctorSpecialtyAndWorkplace = await db.Doctor_specialty_medicalFacility.findOne({
                where: {
                    doctorId: doctorId,
                },
                include: [
                    {
                        model: db.Specialty,
                        attributes: ["id", "name"],
                    },
                    {
                        model: db.ComplexMedicalFacility,
                        as: "medicalFacilityDoctorAndSpecialty",
                        attributes: ["id", "name", "address"],
                    },
                ],
            });

            return resolve({
                errCode: 0,
                data: {
                    totalPatients,
                    todayAppointments,
                    completedToday,
                    pendingAppointments,
                    doctorSpecialtyAndWorkplace,
                },
            });
        } catch (e) {
            reject(e);
        }
    });
};

let getDoctorStatisticMonthlyPatientsService = (doctorId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!doctorId) {
                return resolve({
                    errCode: 1,
                    errMessage: "Missing required parameter doctorId!",
                });
            }

            const { Op, fn, col, literal } = db.Sequelize;
            const now = new Date();
            const currentMonth = now.getMonth() + 1; // 1-12
            const currentYear = now.getFullYear();

            // Chọn nửa năm
            const startMonth = currentMonth <= 6 ? 1 : 7;
            const endMonth = currentMonth <= 6 ? 6 : 12;

            // ===============================
            // 1) Monthly Patients
            // ===============================
            const monthlyRaw = await db.Booking.findAll({
                where: {
                    doctorId,
                    [Op.and]: [
                        db.sequelize.where(fn("YEAR", col("date")), currentYear),
                        db.sequelize.where(fn("MONTH", col("date")), {
                            [Op.between]: [startMonth, endMonth],
                        }),
                    ],
                },
                attributes: [
                    [fn("MONTH", col("date")), "month"],
                    [fn("COUNT", col("*")), "patients"],
                ],
                group: [fn("MONTH", col("date"))],
                order: [[fn("MONTH", col("date")), "ASC"]],
                raw: true,
            });

            // Chuẩn hóa (fill đủ tháng)
            const monthlyPatients = [];
            for (let m = startMonth; m <= endMonth; m++) {
                const found = monthlyRaw.find((x) => Number(x.month) === m);
                monthlyPatients.push({
                    month: `Tháng ${m}`,
                    patients: found ? Number(found.patients) : 0,
                });
            }

            // ===============================
            // 2) Monthly Revenue
            // ===============================
            const monthlyRevenueRaw = await db.Booking.findAll({
                where: {
                    doctorId,
                    paymentStatus: "PT3", // chỉ thanh toán xong
                    [Op.and]: [
                        db.sequelize.where(fn("YEAR", col("date")), currentYear),
                        db.sequelize.where(fn("MONTH", col("date")), {
                            [Op.between]: [startMonth, endMonth],
                        }),
                    ],
                },
                attributes: [
                    [fn("MONTH", col("date")), "month"],
                    [fn("SUM", col("paidAmount")), "revenue"],
                    [fn("COUNT", col("*")), "patients"],
                ],
                group: [fn("MONTH", col("date"))],
                order: [[fn("MONTH", col("date")), "ASC"]],
                raw: true,
            });

            const monthlyRevenue = [];
            for (let m = startMonth; m <= endMonth; m++) {
                const found = monthlyRevenueRaw.find((x) => Number(x.month) === m);
                monthlyRevenue.push({
                    month: `${m}`,
                    revenue: found ? Number(found.revenue) : 0,
                    patients: found ? Number(found.patients) : 0,
                });
            }

            // ===============================
            // 3) Frequent Patients (TOP 4)
            // ===============================
            const frequentRaw = await db.Booking.findAll({
                where: { doctorId },
                include: [
                    {
                        model: db.User,
                        as: "patientHasAppointmentWithDoctors",
                        attributes: ["firstName", "lastName"],
                    },
                ],
                attributes: ["patientId", "patientBirthday", [fn("COUNT", col("Booking.patientId")), "visits"], [fn("MAX", col("date")), "lastVisit"]],
                group: ["patientId", "patientBirthday", "patientHasAppointmentWithDoctors.id", "patientHasAppointmentWithDoctors.firstName", "patientHasAppointmentWithDoctors.lastName"],
                order: [[literal("visits"), "DESC"]],
                limit: 4,
                raw: true,
                nest: true,
            });

            const frequentPatients = frequentRaw.map((item) => {
                let age = null;
                if (item.patientBirthday) {
                    const bd = new Date(item.patientBirthday);
                    if (!isNaN(bd)) {
                        age = now.getFullYear() - bd.getFullYear();
                        const mm = now.getMonth() - bd.getMonth();
                        const dd = now.getDate() - bd.getDate();
                        if (mm < 0 || (mm === 0 && dd < 0)) age--;
                    }
                }

                const first = item.patientHasAppointmentWithDoctors?.firstName || "";
                const last = item.patientHasAppointmentWithDoctors?.lastName || "";
                const name = `${last} ${first}`.trim();

                const lastVisitStr = item.lastVisit ? new Date(item.lastVisit).toLocaleDateString("vi-VN") : null;

                return {
                    name,
                    age,
                    visits: Number(item.visits),
                    lastVisit: lastVisitStr,
                };
            });

            // ===============================
            // RETURN
            // ===============================
            return resolve({
                errCode: 0,
                data: {
                    monthlyPatients,
                    frequentPatients,
                    monthlyRevenue,
                },
            });
        } catch (e) {
            reject(e);
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
    getDoctorAppointmentsTodayOverviewStatisticsService: getDoctorAppointmentsTodayOverviewStatisticsService,
    getDoctorStatisticMonthlyPatientsService: getDoctorStatisticMonthlyPatientsService,
};
