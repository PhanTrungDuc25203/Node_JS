import db from "../models/index";
require("dotenv").config();

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
                where: { medicalFacilityId: medicalFacilityId },
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

module.exports = {
    createResultTemplateService: createResultTemplateService,
    getResultPendingExamPackageService: getResultPendingExamPackageService,
};
