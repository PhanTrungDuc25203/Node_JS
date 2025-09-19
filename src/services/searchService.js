import db from "../models/index";
let { Op, Sequelize } = require("sequelize");

// -------------------------
// Helper: search với fallback + tag
// -------------------------
let searchWithFallback = async (
  model,
  searchterm,
  fields,
  include = [],
  baseWhere = {}
) => {
  // 1. Exact search (LIKE %...%)
  let result = await model.findAll({
    where: {
      ...baseWhere,
      [Op.or]: fields.map((field) => ({
        [field]: { [Op.like]: `%${searchterm}%` },
      })),
    },
    include,
  });

  if (result.length > 0) {
    return { tag: "exact", data: result };
  }

  // 2. Resemble: SOUNDEX
  result = await model.findAll({
    where: {
      ...baseWhere,
      [Op.or]: fields.map((field) =>
        Sequelize.where(
          Sequelize.fn("SOUNDEX", Sequelize.col(field)),
          Sequelize.fn("SOUNDEX", searchterm)
        )
      ),
    },
    include,
  });

  if (result.length > 0) {
    return { tag: "resemble", data: result };
  }

  // 3. Resemble: prefix (LIKE searchterm%)
  result = await model.findAll({
    where: {
      ...baseWhere,
      [Op.or]: fields.map((field) => ({
        [field]: { [Op.like]: `${searchterm}%` },
      })),
    },
    include,
  });

  if (result.length > 0) {
    return { tag: "resemble", data: result };
  }

  return { tag: "none", data: [] };
};

// -------------------------
// Các hàm search cụ thể
// -------------------------
let searchSpecialty = (searchterm) =>
  searchWithFallback(db.Specialty, searchterm, ["name", "markdownDescription"]);

let searchExamPackage = (searchterm) =>
  searchWithFallback(db.ExamPackage_specialty_medicalFacility, searchterm, [
    "name",
    "markdownDescription",
    "markdownCategory",
  ]);

let searchComplexFacility = (searchterm) =>
  searchWithFallback(db.ComplexMedicalFacility, searchterm, [
    "name",
    "address",
    "markdownDescription",
    "markdownEquipment",
  ]);

let searchDoctor = async (searchterm) => {
  // 1) Tìm trên User (ưu tiên)
  let includeDoctorInfor = {
    model: db.Doctor_infor,
    required: false,
  };
  let userBaseWhere = { roleId: "R2" };

  let userSearch = await searchWithFallback(
    db.User,
    searchterm,
    ["firstName", "lastName", "email"],
    [includeDoctorInfor],
    userBaseWhere
  );

  if (userSearch.tag !== "none") {
    return userSearch;
  }

  // 2) Nếu không tìm thấy ở User => tìm trong Doctor_infor
  let includeUser = {
    model: db.User,
    where: { roleId: "R2" },
    attributes: ["firstName", "lastName", "email"],
    required: false,
  };

  let doctorSearch = await searchWithFallback(
    db.Doctor_infor,
    searchterm,
    ["clinicAddress", "clinicName"],
    [includeUser]
  );

  return doctorSearch;
};

// -------------------------
// Hàm chính gọi theo filter
// -------------------------
let allMedicalServiceFilterSearchService = async (searchterm, filter) => {
  try {
    if (!searchterm) {
      return {
        errCode: 1,
        errMessage: "Missing required parameter: searchterm!",
      };
    }

    let result = {};

    if (filter) {
      switch (filter) {
        case "specialty":
          result = { specialty: await searchSpecialty(searchterm) };
          break;
        case "exam_package":
          result = { exam_package: await searchExamPackage(searchterm) };
          break;
        case "complex_facility":
          result = {
            complex_facility: await searchComplexFacility(searchterm),
          };
          break;
        case "doctor":
          result = { doctor: await searchDoctor(searchterm) };
          break;
        default:
          return {
            errCode: 2,
            errMessage: "Invalid filter!",
          };
      }
    } else {
      // Nếu không có filter → search tất cả
      let [specialty, examPackage, complexFacility, doctor] = await Promise.all(
        [
          searchSpecialty(searchterm),
          searchExamPackage(searchterm),
          searchComplexFacility(searchterm),
          searchDoctor(searchterm),
        ]
      );

      result = {
        specialty,
        exam_package: examPackage,
        complex_facility: complexFacility,
        doctor,
      };
    }

    return {
      errCode: 0,
      errMessage: "Search successfully!",
      data: result,
    };
  } catch (e) {
    console.error("Search service error:", e);
    return {
      errCode: -1,
      errMessage: "Search error from server!",
      error: e.message,
    };
  }
};

module.exports = {
  allMedicalServiceFilterSearchService,
};
