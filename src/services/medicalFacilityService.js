import db from "../models/index";
import bcrypt from 'bcryptjs';
import moment from "moment";
require('dotenv').config();
import _ from 'lodash';
import sendEmailService from "./sendEmailService";
import { v4 as uuidv4 } from 'uuid';

const MAX_NUMBER_CAN_USE_PACKAGE = process.env.MAX_NUMBER_CAN_USE_PACKAGE;

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
            if (inputId === 'ALLANDIMAGEBUTSHORT') {
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
            if (inputId === 'ALLANDIMAGEANDLIMITED') {
                medicalFacilityRes = db.ComplexMedicalFacility.findAll({
                    include: [
                        {
                            model: db.MedicalFacilitySpecialtyArea, as: 'medicalFacilitySpecialtyData',
                            attributes: ['medicalFacilityId', 'specialtyId']
                        },
                    ],
                    attributes: {
                        exclude: ['htmlDescription', 'markdownDescription', 'htmlEquipment', 'markdownEquipment', 'createdAt', 'updatedAt']
                    },
                    limit: 20 // Giới hạn số lượng bản ghi trả về là 20
                })
            }
            if (inputId && inputId !== 'ALL' && inputId !== 'ALLANDIMAGE' && inputId !== 'ALLANDIMAGEANDLIMITED' && inputId !== 'ALLANDIMAGEBUTSHORT') {
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
                        },
                        {
                            model: db.ExamPackage_specialty_medicalFacility, as: 'medicalFacilityPackage',
                            attributes: ['id', 'name'],
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

let checkRequiredFieldForAPackage = (inputData) => {
    let arrFields = [
        'name',
        'selectedSpecialty',
        'selectedPrice',
        'selectedMedicalFacility',
        'htmlDescription',
        'markdownDescription',
        'htmlCategory',
        'markdownCategory',
        'image',
    ];
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

let createExamPackageService = (inputData) => {
    return new Promise(async (resolve, reject) => {
        try {
            let checkObj = checkRequiredFieldForAPackage(inputData);
            if (checkObj.isValid === false) {
                resolve({
                    errCode: 1,
                    errMessage: `Missing parameter(s): required information for a Exam package!`
                });
            } else {
                try {
                    console.log("Check data: ", inputData.name, inputData.selectedSpecialty, inputData.selectedPrice, inputData.selectedMedicalFacility);
                    await db.ExamPackage_specialty_medicalFacility.create({
                        name: inputData.name,
                        specialtyId: inputData.selectedSpecialty,
                        priceId: inputData.selectedPrice,
                        medicalFacilityId: inputData.selectedMedicalFacility,
                        htmlDescription: inputData.htmlDescription,
                        markdownDescription: inputData.markdownDescription,
                        htmlCategory: inputData.htmlCategory,
                        markdownCategory: inputData.markdownCategory,
                        image: inputData.image,
                    })

                    resolve({
                        errCode: 0,
                        errMessage: `Create a exam package successfully!`
                    });
                } catch (error) {
                    reject(error);
                }
            }
        } catch (e) {
            reject(e);
        }
    })
}

let bulkCreateTimeframesForExamPackageScheduleService = (inputData) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!inputData.scheduleArr || !inputData.examPackageId || !inputData.formatedDate) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameters: timeframe data!',
                })
            } else {
                let availableTimeframe = inputData.scheduleArr;
                if (availableTimeframe && availableTimeframe.length > 0) {
                    availableTimeframe.map(item => {
                        item.maxNumber = MAX_NUMBER_CAN_USE_PACKAGE;
                        return item;
                    })
                }

                //kiểm tra timeframe của một gói khám đã tồn tại
                let existing = await db.ExamPackageSchedule.findAll({
                    where: { examPackageId: inputData.examPackageId, date: inputData.formatedDate },
                    attributes: ['timeType', 'date', 'examPackageId', 'maxNumber'],
                    raw: true,
                })

                if (existing && existing.length > 0) {
                    existing = existing.map(item => {
                        item.date = new Date(item.date).getTime();
                        return item;
                    })
                }

                //compare to find differences
                let needAdding = _.differenceWith(availableTimeframe, existing, (a, b) => {
                    return a.timeType === b.timeType && a.date === b.date;
                })

                //đổi trường id của needAdding sang examPackageId vì thế mới có thể lưu nếu không sẽ bị trùng với id của bảng
                needAdding = needAdding.map(item => {
                    const { id, ...rest } = item; // Bỏ trường id
                    return { ...rest, examPackageId: inputData.examPackageId }; // Thêm examPackageId
                });
                // create
                if (needAdding && needAdding.length > 0) {
                    await db.ExamPackageSchedule.bulkCreate(needAdding);
                }

                resolve({
                    errCode: 0,
                    errMessage: 'Create available time for package successfully!',
                });
            }

        } catch (e) {
            reject(e);
        }
    })
}

let getAllExamPackageService = (inputId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let packageRes = {};
            if (inputId === 'ALL') {
                packageRes = db.ExamPackage_specialty_medicalFacility.findAll({
                    attributes: {
                        exclude: ['htmlDescription', 'markdownDescription', 'htmlCategory', 'markdownCategory', 'image', 'createdAt', 'updatedAt']
                    },
                    include: [
                        { model: db.Allcode, as: 'priceDataForPackage', attributes: ['value_Eng', 'value_Vie'] },
                    ],
                })
            }
            if (inputId === 'ALLANDIMAGE') {
                packageRes = db.ExamPackage_specialty_medicalFacility.findAll({
                    attributes: {
                        exclude: ['createdAt', 'updatedAt']
                    }
                })
            }
            if (inputId && inputId !== 'ALL' && inputId !== 'ALLANDIMAGE') {
                packageRes = db.ExamPackage_specialty_medicalFacility.findAll({
                    where: { id: inputId },
                    attributes: {
                        exclude: ['createdAt', 'updatedAt']
                    },
                    include: [
                        { model: db.Allcode, as: 'priceDataForPackage', attributes: ['value_Eng', 'value_Vie'] },
                    ],
                })
            }
            resolve(packageRes);
        } catch (e) {
            reject(e);
        }
    })
}

let getPackageScheduleByDateService = (packageId, date) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!packageId || !date) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter: packageId or date!',
                })
            } else {
                // let formattedDate = moment(Number(date)).format('YYYY-MM-DD 00:00:00');
                // console.log("Check formatted date: ", date, "type of date: ", typeof date);
                let numberDate = Number(date);
                // console.log("Check number date (number): ", numberDate, "type of date: ", typeof numberDate);
                // console.log("Check formatted date (number): ", formattedDate, "type of date: ", typeof formattedDate);
                let scheduleData = await db.ExamPackageSchedule.findAll({
                    where: {
                        examPackageId: packageId,
                        date: numberDate,
                    },
                    include: [
                        { model: db.Allcode, as: 'timeTypeDataForPackage', attributes: ['value_Eng', 'value_Vie'] },
                    ],
                    raw: false,
                    nest: true,
                });

                // console.log("Check schedule data: ", scheduleData);
                if (!scheduleData) {
                    scheduleData = ["no schedule"];
                }

                resolve({
                    errCode: 0,
                    errMessage: "Get exam package schedule successfully!",
                    data: scheduleData,
                })
            }
        } catch (e) {

        }
    })
}

let buildUrlConfirmMedicalRecord = (doctorId, token) => {
    let result = `${process.env.URL_REACT_SERVER}/confirm-booking?token=${token}&doctorId=${doctorId}`;
    return result;
}

let patientInforWhenBookingExamPackageService = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.email || !data.packageId || !data.timeType || !data.date ||
                !data.fullname || !data.appointmentMoment || !data.phoneNumber
            ) {
                resolve({
                    errCode: 1,
                    errMessage: `Missing parameter(s)!`,
                })
            } else {
                let packageInfor = await db.ExamPackage_specialty_medicalFacility.findOne({
                    where: { id: data.packageId },
                    attributes: {
                        exclude: ['id', 'htmlDescription', 'markdownDescription', 'htmlCategory', 'markdownCategory', 'image']
                    },
                    include: [
                        { model: db.ComplexMedicalFacility, as: 'medicalFacilityPackage', attributes: ['name'] },
                    ],
                    raw: false,
                })

                let token = uuidv4(); // ⇨ '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d'

                await sendEmailService.sendAEmail({
                    receiverEmail: data.email,
                    patientName: data.fullname,
                    time: data.appointmentMoment,
                    doctorName: packageInfor.name,
                    clinicName: '',
                    clinicAddress: packageInfor.medicalFacilityPackage.name,
                    language: data.language,
                    redirectLink: buildUrlConfirmMedicalRecord(data.packageId, token),
                });

                //upsert data
                let fullName = data.fullname.trim();  // loại bỏ khoảng trắng thừa nếu có
                let lastSpaceIndex = fullName.lastIndexOf(' ');

                let firstName = lastSpaceIndex === -1 ? fullName : fullName.slice(lastSpaceIndex + 1);
                let lastName = lastSpaceIndex === -1 ? '' : fullName.slice(0, lastSpaceIndex);

                let patient = await db.User.findOrCreate({
                    where: { email: data.email },
                    defaults: {
                        email: data.email,
                        lastName: lastName,
                        firstName: firstName,
                        phoneNumber: data.phoneNumber,
                        address: data.address,
                        gender: data.selectedGender,
                        roleId: 'R3',
                    }
                });

                // let patient = await db.User.findOrCreate({
                //     where: { email: data.email },
                //     defaults: {
                //         email: data.email,
                //         lastName: data.fullname,
                //         phoneNumber: data.phoneNumber,
                //         address: data.address,
                //         gender: data.selectedGender,
                //         roleId: 'R3',
                //     }
                // });

                //create a booking records
                // if (patient && patient[0]) {
                //     await db.Booking.findOrCreate({
                //         where: {//khi khác S3 thì không lưu bản ghi mới: db.Sequelize.Op.ne là not equal = ne
                //             patientId: patient[0].id, doctorId: data.doctorId, statusId: { [db.Sequelize.Op.ne]: 'S3' }
                //         },
                //         defaults: {
                //             statusId: 'S1', //hardcode
                //             doctorId: data.doctorId,
                //             patientId: patient[0].id,
                //             date: data.date,
                //             timeType: data.timeType,
                //             patientPhoneNumber: data.phoneNumber,
                //             patientBirthday: data.birthday,
                //             patientAddress: data.address,
                //             patientGender: data.selectedGender,
                //             token: token,
                //         }
                //     })
                // }

                resolve({
                    errCode: 0,
                    errMessage: `Save patient's information successfully!`,
                    // data: patient,
                });
            }
        } catch (e) {
            reject(e);
        }
    })
}

module.exports = {
    createMedicalFacilityService: createMedicalFacilityService,
    getInfoOfMedicalFacilityService: getInfoOfMedicalFacilityService,
    createExamPackageService: createExamPackageService,
    bulkCreateTimeframesForExamPackageScheduleService: bulkCreateTimeframesForExamPackageScheduleService,
    getAllExamPackageService: getAllExamPackageService,
    getPackageScheduleByDateService: getPackageScheduleByDateService,
    patientInforWhenBookingExamPackageService: patientInforWhenBookingExamPackageService,
}