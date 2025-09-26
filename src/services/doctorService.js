import { resolveInclude } from "ejs";
import db from "../models/index";
import bcrypt from "bcryptjs";
require("dotenv").config();
import _ from "lodash";
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
    let arrFields = ["doctorId", "htmlContent", "markdownContent", "action", "selectedPrice", "selectedPaymentMethod", "selectedProvince", "clinicName", "clinicAddress", "note", "specialtyId", "selectedMedicalFacility"];
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

                console.log("Check schedule data: ", scheduleData);
                if (!scheduleData) {
                    scheduleData = ["no schedule"];
                }

                resolve({
                    errCode: 0,
                    errMessage: "Get doctor schedule successfully!",
                    data: scheduleData,
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
            // Kiểm tra các tham số bắt buộc
            console.log("Check data: ", inputData);
            if (!inputData.appointmentId || !inputData.patientEmail || !inputData.doctorEmail || !inputData.description || !inputData.files || !inputData.appointmentDate || !inputData.appointmentTimeFrame) {
                resolve({
                    errCode: 1,
                    errMessage: "Missing required parameters!",
                });
            } else {
                let existingHistory = await db.History.findOne({
                    where: {
                        patientEmail: inputData.patientEmail,
                        doctorEmail: inputData.doctorEmail,
                    },
                    order: [["createdAt", "DESC"]],
                });

                if (existingHistory) {
                    let currentTime = new Date();
                    let createdTime = new Date(existingHistory.createdAt);
                    // nếu history mới và cũ cách nhau chưa đầy 1 giờ thì thôi abacut
                    let timeDifference = (currentTime - createdTime) / (1000 * 60);

                    if (timeDifference < 60) {
                        resolve({
                            errCode: 2,
                            errMessage: "Cannot save history, another record exists within the last hour.",
                        });
                        return;
                    }
                }

                //chuyển đổi kiểu dữ liệu
                let fileBuffer = Buffer.from(inputData.files, "base64");
                let formattedDate = moment(inputData.appointmentDate, "DD-MM-YYYY").format("YYYY-MM-DD 00:00:00");
                let formettedTimeFrame = await db.Allcode.findOne({
                    where: {
                        type: "TIME",
                        value_Vie: inputData.appointmentTimeFrame,
                    },
                    attributes: ["keyMap"],
                });
                //lưu dữ liệu history
                await db.History.create({
                    appointmentId: inputData.appointmentId,
                    patientEmail: inputData.patientEmail,
                    doctorEmail: inputData.doctorEmail,
                    appointmentDate: formattedDate,
                    appointmentTimeFrame: formettedTimeFrame.keyMap,
                    description: inputData.description,
                    files: fileBuffer,
                });

                let booking = await db.Booking.findOne({
                    where: { id: inputData.appointmentId },
                    raw: false,
                });

                if (booking) {
                    booking.statusId = "S3";
                    await booking.save();
                }

                resolve({
                    errCode: 0,
                    errMessage: "Save appointment history successfully!",
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
                let data = await db.History.findAll({
                    where: { doctorEmail: inputDoctorEmail },
                    attributes: {
                        exclude: ["createdAt", "updatedAt", "id"],
                    },
                    include: [{ model: db.Allcode, as: "appointmentTimeFrameData", attributes: ["value_Eng", "value_Vie"] }],
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
            }
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
    getAppointmentHistoriesByDoctorEmailService: getAppointmentHistoriesByDoctorEmailService,
};
