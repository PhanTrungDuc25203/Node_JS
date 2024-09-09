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

let getSpecialtyForHomePageService = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let specialties = await db.Specialty.findAll({
                // where: {
                //     roleId: 'R2',
                // },
                order: [['createdAt', 'ASC']],
                // attributes: {
                //     exclude: ['password'],
                // },
                // include: [
                //     { model: db.Allcode, as: 'positionData', attributes: ['value_Eng', 'value_Vie'] },
                //     { model: db.Allcode, as: 'genderData', attributes: ['value_Eng', 'value_Vie'] },
                // ],
                raw: true,
            })
            resolve({
                errCode: 0,
                data: specialties,
            })
        } catch (e) {
            reject(e);
        }
    })
}

module.exports = {
    createSpecialtyService: createSpecialtyService,
    getSpecialtyForHomePageService: getSpecialtyForHomePageService,
}