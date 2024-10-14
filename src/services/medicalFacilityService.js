import db from "../models/index";
import bcrypt from 'bcryptjs';
import moment from "moment";

let checkRequiredField = (inputData) => {
    let arrFields = ['name', 'provinceId', 'address', 'htmlDescription', 'markdownDescription',
        'htmlEquipment', 'markdownEquipment', 'image', 'selectedSpecialty'];
    let isValid = true;
    let element = '';
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
    }
}

let createMedicalFacilityService = (inputData) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Kiểm tra các trường cần thiết
            let checkObj = checkRequiredField(inputData);
            if (checkObj.isValid === false) {
                resolve({
                    errCode: 1,
                    errMessage: `Missing parameter(s): required information for a medical facility!`
                });
            } else {
                // Bắt đầu transaction để đảm bảo tính toàn vẹn của dữ liệu
                const transaction = await db.sequelize.transaction();

                try {
                    // Lưu medical facility trước và nhận lại id
                    let newMedicalFacility = await db.ComplexMedicalFacility.create({
                        name: inputData.name,
                        provinceId: inputData.provinceId,
                        address: inputData.address,
                        htmlDescription: inputData.htmlDescription,
                        markdownDescription: inputData.markdownDescription,
                        htmlEquipment: inputData.htmlEquipment,
                        markdownEquipment: inputData.markdownEquipment,
                        image: inputData.image,
                    }, { transaction });

                    // Xử lý selectedSpecialty, sử dụng map để tạo nhiều bản ghi
                    if (inputData.selectedSpecialty && inputData.selectedSpecialty.length > 0) {
                        let specialtyRecords = inputData.selectedSpecialty.map(specialty => {
                            return {
                                medicalFacilityId: newMedicalFacility.id,  // id của medical facility vừa tạo
                                specialtyId: specialty.value  // lấy value từ selectedSpecialty
                            };
                        });

                        // Sử dụng bulkCreate để lưu nhiều bản ghi cùng lúc
                        await db.MedicalFacilitySpecialtyArea.bulkCreate(specialtyRecords, { transaction });
                    }

                    // Commit transaction sau khi lưu thành công
                    await transaction.commit();

                    resolve({
                        errCode: 0,
                        errMessage: `Create a medical facility record and associated specialty areas successfully!`
                    });
                } catch (error) {
                    // Rollback nếu có lỗi
                    await transaction.rollback();
                    reject(error);
                }
            }
        } catch (e) {
            reject(e);
        }
    })
}

let getInfoOfMedicalFacilityService = (inputId) => {
    return new Promise(async (resolve, reject) => {
        try {
            console.log("CHeck input Id: ", inputId);
            let medicalFacilityRes = {};
            if (inputId === 'ALL') {
                medicalFacilityRes = db.ComplexMedicalFacility.findAll({
                    include: [
                        {
                            model: db.MedicalFacilitySpecialtyArea, as: 'medicalFacilitySpecialtyData',
                            attributes: ['medicalFacilityId', 'specialtyId']
                        },
                    ],
                    attributes: {
                        exclude: ['htmlDescription', 'markdownDescription', 'htmlEquipment', 'markdownEquipment', 'image', 'createdAt', 'updatedAt']
                    }
                })
            }
            if (inputId === 'ALLANDIMAGE') {
                medicalFacilityRes = db.ComplexMedicalFacility.findAll({
                    include: [
                        {
                            model: db.MedicalFacilitySpecialtyArea, as: 'medicalFacilitySpecialtyData',
                            attributes: ['medicalFacilityId', 'specialtyId']
                        },
                    ],
                    attributes: {
                        exclude: ['htmlDescription', 'markdownDescription', 'htmlEquipment', 'markdownEquipment', 'createdAt', 'updatedAt']
                    }
                })
            }
            if (inputId && inputId !== 'ALL' && inputId !== 'ALLANDIMAGE') {
                medicalFacilityRes = db.ComplexMedicalFacility.findAll({
                    where: { id: inputId },
                    include: [
                        {
                            model: db.MedicalFacilitySpecialtyArea, as: 'medicalFacilitySpecialtyData',
                            attributes: ['medicalFacilityId', 'specialtyId'],
                            include: [
                                {
                                    model: db.Specialty, as: 'medicalFacilityHaveSpecialty',
                                    attributes: ['name'],
                                }
                            ]
                        },
                        {
                            model: db.Allcode, as: 'provinceTypeDataForFacility',
                            attributes: ['value_Eng', 'value_Vie']
                        },
                        {
                            model: db.Doctor_specialty_medicalFacility, as: 'medicalFacilityDoctorAndSpecialty',
                            attributes: ['specialtyId', 'doctorId'],
                        }
                    ],
                    attributes: {
                        exclude: ['createdAt', 'updatedAt']
                    }
                })
            }

            resolve(medicalFacilityRes);
        } catch (e) {
            reject(e);
        }
    })
}

module.exports = {
    createMedicalFacilityService: createMedicalFacilityService,
    getInfoOfMedicalFacilityService: getInfoOfMedicalFacilityService,
}