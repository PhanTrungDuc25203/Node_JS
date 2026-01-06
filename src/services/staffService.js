import db from "../models/index";
require("dotenv").config();
import sendMedicalReportService from "./sendMedicalReportService";

let createResultTemplateService = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const { examPackageId, version, template } = data;

            if (!examPackageId || !template) {
                return resolve({
                    errCode: 1,
                    errMessage: "Missing required parameters!",
                });
            }

            let finalTemplate = typeof template === "object" ? JSON.stringify(template) : template;

            let exist = await db.ExamPackage_result_template.findOne({
                where: { examPackageId: examPackageId, version: version || 1 },
                raw: false,
            });

            if (exist) {
                exist.template = finalTemplate;
                await exist.save();

                return resolve({
                    errCode: 0,
                    errMessage: "Updated existing template successfully!",
                    data: exist,
                });
            }

            let newTemplate = await db.ExamPackage_result_template.create({
                examPackageId: examPackageId,
                version: version || 1,
                template: finalTemplate,
            });

            resolve({
                errCode: 0,
                errMessage: "Create template successfully!",
                data: newTemplate,
            });
        } catch (e) {
            reject(e);
        }
    });
};

let getResultPendingExamPackageService = (medicalFacilityId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!medicalFacilityId) {
                return resolve({
                    errCode: 1,
                    errMessage: "Missing required parameters!",
                });
            }

            let examPackageData = await db.ExamPackage_specialty_medicalFacility.findAll({
                where: {
                    medicalFacilityId: medicalFacilityId,
                },
                attributes: {
                    exclude: ["createdAt", "updatedAt", "image", "htmlDescription", "markdownDescription", "htmlCategory", "markdownCategory"],
                },
                include: [
                    {
                        model: db.Allcode,
                        as: "priceDataForPackage",
                        attributes: ["value_Eng", "value_Vie"],
                    },
                    {
                        model: db.ComplexMedicalFacility,
                        as: "medicalFacilityPackage",
                        attributes: ["id", "name", "address"],
                    },
                    {
                        model: db.ExamPackage_booking,
                        as: "bookings",
                        attributes: {
                            exclude: ["createdAt", "updatedAt"],
                        },
                        include: [
                            {
                                model: db.User,
                                as: "patientBookingExamPackageData",
                                attributes: {
                                    exclude: ["image", "updatedAt", "createdAt"],
                                },
                            },
                            {
                                model: db.ExamPackage_result,
                                as: "examPackageResult",
                            },
                        ],
                    },
                    {
                        model: db.ExamPackage_result_template,
                        as: "resultTemplates",
                    },
                ],
            });

            resolve({
                errCode: 0,
                errMessage: "Create template successfully!",
                examPackageData: examPackageData,
            });
        } catch (e) {
            reject(e);
        }
    });
};

let saveExamPackageResultService = (resultData) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!resultData) {
                return resolve({
                    errCode: 1,
                    errMessage: "Missing required parameters!",
                });
            }

            let newResult = await db.ExamPackage_result.create({
                bookingId: resultData.bookingId,
                template: resultData.template,
                staffId: resultData.staffId,
                result: resultData.results,
                status: resultData.status,
            });

            let examPackageBookingData = await db.ExamPackage_booking.findOne({
                where: {
                    id: resultData.bookingId,
                },
                include: [
                    {
                        model: db.User,
                        as: "patientBookingExamPackageData",
                        attributes: ["email", "firstName", "lastName"],
                    },
                    {
                        model: db.ExamPackage_specialty_medicalFacility,
                        as: "examPackage",
                        attributes: {
                            exclude: ["htmlDescription", "markdownDescription", "htmlCategory", "markdownCategory"],
                        },
                        include: [
                            {
                                model: db.ComplexMedicalFacility,
                                as: "medicalFacilityPackage",
                                attributes: {
                                    exclude: ["htmlDescription", "markdownDescription", "htmlEquipment", "markdownEquipment", "image"],
                                },
                            },
                            {
                                model: db.Specialty,
                                as: "examPackageHaveSpecialty",
                                attributes: {
                                    exclude: ["specialtyImage"],
                                },
                            },
                        ],
                    },
                    {
                        model: db.ExamPackage_result,
                        as: "examPackageResult",
                    },
                    {
                        model: db.Allcode,
                        as: "examPackageTimeTypeData",
                    },
                ],
            });

            // gửi kết quả qua email người dùng ở đây
            await sendMedicalReportService.sendMedicalReportToPatient({
                examType: "examPackage",
                receiverEmail: examPackageBookingData.patientBookingExamPackageData.email,
                patientName: `${examPackageBookingData.patientBookingExamPackageData.lastName}
                  ${examPackageBookingData.patientBookingExamPackageData.firstName}`,
                packageName: examPackageBookingData.examPackage.name,
                medicalFacilityName: examPackageBookingData.examPackage.medicalFacilityPackage.name,
                appointmentDate: examPackageBookingData.date,
                examPackageResult: {
                    template: examPackageBookingData.examPackageResult.template,
                    result: examPackageBookingData.examPackageResult.result,
                },
            });

            resolve({
                errCode: 0,
                errMessage: "Create exam package result successfully!",
                newResult: newResult,
            });

            resolve({
                errCode: 0,
                errMessage: "Save exam package result successfully!",
            });
        } catch (e) {
            reject(e);
        }
    });
};

let getExamPackageResultService = (bookingId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!bookingId) {
                return resolve({
                    errCode: 1,
                    errMessage: "Missing required parameters!",
                });
            }

            let examPackageResult = await db.ExamPackage_result.findOne({
                where: {
                    bookingId: bookingId,
                },
            });

            resolve({
                errCode: 0,
                errMessage: "Create template successfully!",
                data: examPackageResult,
            });
        } catch (e) {
            reject(e);
        }
    });
};

let getStaffInfoService = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!id) {
                return resolve({
                    errCode: 1,
                    errMessage: "Missing required parameters!",
                });
            }

            let data = await db.MedicalFacility_staff.findOne({
                where: {
                    staffId: id,
                },
                attributes: {
                    exclude: [""],
                },
                include: [
                    {
                        model: db.ComplexMedicalFacility,
                        as: "medicalFacilityStaffAndSpecialty",
                        attributes: ["id", "name", "address"],
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
        } catch (e) {
            reject(e);
        }
    });
};

let updateExamPackageBookingDoneService = (bookingId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!bookingId) {
                return resolve({
                    errCode: 1,
                    errMessage: "Missing required parameters!",
                });
            }

            let needUpdatedBooking = await db.ExamPackage_booking.findOne({
                where: {
                    id: bookingId,
                },
            });

            if (needUpdatedBooking) {
                needUpdatedBooking.statusId = "S3";
                needUpdatedBooking.save();
            }

            resolve({
                errCode: 0,
            });
        } catch (e) {
            reject(e);
        }
    });
};

module.exports = {
    createResultTemplateService: createResultTemplateService,
    getResultPendingExamPackageService: getResultPendingExamPackageService,
    saveExamPackageResultService: saveExamPackageResultService,
    getExamPackageResultService: getExamPackageResultService,
    getStaffInfoService: getStaffInfoService,
    updateExamPackageBookingDoneService: updateExamPackageBookingDoneService,
};
