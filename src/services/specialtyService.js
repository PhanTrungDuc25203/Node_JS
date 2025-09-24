import db from "../models/index";

let createSpecialtyService = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (
        !data.name ||
        !data.imageBase64 ||
        !data.htmlDescription ||
        !data.markdownDescription
      ) {
        resolve({
          errCode: 1,
          errMessage: "Missing parameter(s)",
        });
      } else {
        await db.Specialty.create({
          name: data.name,
          htmlDescription: data.htmlDescription,
          markdownDescription: data.markdownDescription,
          specialtyImage: data.imageBase64,
        });
        resolve({
          errCode: 0,
          errMessage: "Create new specialty successfully!",
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

import { Op } from "sequelize";

let getSpecialtyForHomePageService = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let specialties = await db.Specialty.findAll({
        where: {
          name: {
            [Op.notLike]: "Khám từ xa -%", // loại các bản ghi có name bắt đầu bằng "Khám từ xa -"
          },
        },
        order: [["createdAt", "ASC"]],
        raw: true,
      });

      resolve({
        errCode: 0,
        data: specialties,
      });
    } catch (e) {
      reject(e);
    }
  });
};

let getRemoteSpecialtyForHomePageService = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let specialties = await db.Specialty.findAll({
        where: {
          name: {
            [Op.like]: "%Khám từ xa -%", // chỉ lấy các bản ghi có chứa "Khám từ xa -"
          },
        },
        order: [["createdAt", "ASC"]],
        raw: true,
      });

      resolve({
        errCode: 0,
        data: specialties,
      });
    } catch (e) {
      reject(e);
    }
  });
};

let getSpecialtyByIdService = (inputId, location) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!inputId || !location) {
        resolve({
          errCode: 1,
          errMessage: "Missing parameter(s): inputId or Location",
        });
      } else {
        let data = await db.Specialty.findOne({
          where: { id: inputId },
          attributes: [
            "name",
            "htmlDescription",
            "markdownDescription",
            "specialtyImage",
          ],
        });

        if (data && data.specialtyImage) {
          data.specialtyImage = Buffer.from(
            data.specialtyImage,
            "base64"
          ).toString("binary");
        }

        if (data) {
          let doctorInSpecialty = [];
          if (location === "ALL") {
            doctorInSpecialty = await db.Doctor_infor.findAll({
              where: { specialtyId: inputId },
              attributes: ["doctorId", "provinceId"],
            });
          } else {
            //find by location
            doctorInSpecialty = await db.Doctor_infor.findAll({
              where: { specialtyId: inputId, provinceId: location },
              attributes: ["doctorId", "provinceId"],
            });
          }
          data = data.toJSON();
          data.doctorInSpecialty = doctorInSpecialty;
        } else {
          data = {};
        }

        resolve({
          errCode: 0,
          errMessage: "Get data successfully!",
          data,
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

let getSpecialtyAndProvinceForMedicalFacilityManagePageService = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let specialties = await db.Specialty.findAll({
        attributes: {
          exclude: [
            "htmlDescription",
            "markdownDescription",
            "specialtyImage",
            "createdAt",
            "updatedAt",
          ],
        },
        order: [["createdAt", "ASC"]],
        raw: true,
      });
      let provinces = await db.Allcode.findAll({
        where: {
          type: "PROVINCE",
        },
        attributes: ["value_Vie", "value_Eng", "keyMap"],
      });
      resolve({
        errCode: 0,
        specialtyData: specialties,
        provinceData: provinces,
      });
    } catch (e) {
      reject(e);
    }
  });
};

module.exports = {
  createSpecialtyService: createSpecialtyService,
  getSpecialtyForHomePageService: getSpecialtyForHomePageService,
  getSpecialtyByIdService: getSpecialtyByIdService,
  getSpecialtyAndProvinceForMedicalFacilityManagePageService:
    getSpecialtyAndProvinceForMedicalFacilityManagePageService,
  getRemoteSpecialtyForHomePageService: getRemoteSpecialtyForHomePageService,
};
