import { resolveInclude } from "ejs";
import db from "../models/index";
import bcrypt from 'bcryptjs';

let getEliteDoctorForHomePage = (limitEliteDoctor) => {
    return new Promise(async (resolve, reject) => {
        try {
            let doctors = await db.User.findAll({
                limit: limitEliteDoctor,
                where: {
                    roleId: 'R2',
                },
                order: [['createdAt', 'DESC']],
                attributes: {
                    exclude: ['password'],
                },
                include: [
                    { model: db.Allcode, as: 'positionData', attributes: ['value_Eng', 'value_Vie'] },
                    { model: db.Allcode, as: 'genderData', attributes: ['value_Eng', 'value_Vie'] },
                ],
                raw: true,
                nest: true,
            })
            resolve({
                errCode: 0,
                data: doctors,
            })
        } catch (e) {
            reject(e);
        }
    })
}

let getAllDoctorsForDoctorArticlePage = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let doctors = await db.User.findAll({
                where: { roleId: 'R2' },
                attributes: {
                    exclude: ['password', 'image'],
                },
            })
            resolve({
                errCode: 0,
                data: doctors,
            });
        } catch (e) {
            reject(e);
        }
    })
}

let saveInforAndArticleOfADoctorService = (inputData) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!inputData.doctorId || !inputData.htmlContent || !inputData.markdownContent) {
                resolve({
                    errCode: 1,
                    errMesage: 'Missing parameters!',
                })
            } else {
                await db.ArticleMarkdown.create({
                    htmlContent: inputData.htmlContent,
                    markdownContent: inputData.markdownContent,
                    description: inputData.description,
                    doctorId: inputData.doctorId,
                    // specialtyId
                    // clinicId
                })

                resolve({
                    errCode: 0,
                    errMessage: 'Save article for doctor successfully!',
                })
            }
        } catch (e) {
            reject(e);
        }
    })
}

let getParticularInforForDoctorPage = (inputDoctorId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!inputDoctorId) {
                resolve({
                    errCode: 1,
                    errMessage: "Missing required parameter(s)!",
                })
            } else {
                let data = await db.User.findOne({
                    where: {
                        id: inputDoctorId
                    },
                    attributes: {
                        exclude: ['password', 'image'],
                    },
                    include: [
                        { model: db.ArticleMarkdown, attributes: ['htmlContent', 'markdownContent', 'description'] },
                        { model: db.Allcode, as: 'positionData', attributes: ['value_Eng', 'value_Vie'] },

                    ],
                    raw: true,
                    nest: true,
                })

                resolve({
                    errCode: 0,
                    data: data,
                })
            }
        } catch (e) {
            reject(e);
        }
    })
}

module.exports = {
    getEliteDoctorForHomePage: getEliteDoctorForHomePage,
    getAllDoctorsForDoctorArticlePage: getAllDoctorsForDoctorArticlePage,
    saveInforAndArticleOfADoctorService: saveInforAndArticleOfADoctorService,
    getParticularInforForDoctorPage: getParticularInforForDoctorPage,
}