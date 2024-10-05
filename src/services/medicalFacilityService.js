import db from "../models/index";
import bcrypt from 'bcryptjs';
import moment from "moment";

let checkRequiredField = (inputData) => {
    let arrFields = ['name', 'provinceId', 'address', 'htmlDescription', 'markdownDescription',
        'htmlEquipment', 'markdownEquipment', 'image'];
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
            let checkObj = checkRequiredField(inputData);
            if (checkObj.isValid === false) {
                resolve({
                    errCode: 1,
                    errMessage: `Missing parameter(s): required information for a medical facility!`
                })
            } else {
                await db.ComplexMedicalFacility.create({
                    name: inputData.name,
                    provinceId: inputData.provinceId,
                    address: inputData.address,
                    htmlDescription: inputData.htmlDescription,
                    markdownDescription: inputData.markdownDescription,
                    htmlEquipment: inputData.htmlEquipment,
                    markdownEquipment: inputData.markdownEquipment,
                    image: inputData.image,
                })
                resolve({
                    errCode: 0,
                    errMessage: `Create a medical facility record successfully!`
                })
            }
        } catch (e) {
            reject(e);
        }
    })
}

module.exports = {
    createMedicalFacilityService: createMedicalFacilityService,
}