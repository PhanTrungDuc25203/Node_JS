import db from "../models/index";

let createSpecialtyService = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.name || !data.imageBase64 || !data.htmlDescription || !data.markdownDescription) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing parameter(s)',
                })
            } else {
                await db.Specialty.create({
                    name: data.name,
                    htmlDescription: data.htmlDescription,
                    markdownDescription: data.markdownDescription,
                    specialtyImage: data.imageBase64,

                })
                resolve({
                    errCode: 0,
                    errMessage: 'Create new specialty successfully!',
                })
            }
        } catch (e) {
            reject(e);
        }
    })
}

module.exports = {
    createSpecialtyService: createSpecialtyService,
}