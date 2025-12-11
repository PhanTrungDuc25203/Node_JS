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

module.exports = {
    createResultTemplateService: createResultTemplateService,
};
