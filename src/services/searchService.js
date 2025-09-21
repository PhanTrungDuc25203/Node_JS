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
  baseWhere = {},
  options = {} // { useFullName: boolean, fullNameCols: ['firstName','lastName'] }
) => {
  const { useFullName = false, fullNameCols = ["firstName", "lastName"] } =
    options;

  // build priority CASE - chỉ thêm CONCAT khi useFullName = true
  const caseParts = fields.map((field, idx) => {
    return `WHEN ${field} LIKE '%${searchterm}%' THEN ${idx + 1}`;
  });

  if (useFullName && fullNameCols.length >= 2) {
    // CONCAT(firstName, ' ', lastName)
    caseParts.push(
      `WHEN CONCAT(${fullNameCols[1]}, ' ', ${fullNameCols[0]}) LIKE '%${searchterm}%' THEN 1`
    );
  }

  const elseVal = fields.length + (useFullName ? 2 : 1);
  const priorityCase = `(CASE ${caseParts.join(" ")} ELSE ${elseVal} END)`;

  // 1) Exact search (LIKE %...%)
  const whereOr_exact = [
    ...fields.map((field) => ({
      [field]: { [Op.like]: `%${searchterm}%` },
    })),
  ];

  if (useFullName && fullNameCols.length >= 2) {
    whereOr_exact.push(
      Sequelize.where(
        Sequelize.fn(
          "concat",
          Sequelize.col(fullNameCols[1]),
          " ",
          Sequelize.col(fullNameCols[0])
        ),
        { [Op.like]: `%${searchterm}%` }
      )
    );
  }

  let result = await model.findAll({
    where: {
      ...baseWhere,
      [Op.or]: whereOr_exact,
    },
    include,
    order: [[Sequelize.literal(priorityCase), "ASC"]],
  });

  if (result.length > 0) {
    return { tag: "exact", data: result };
  }

  // 2) Resemble: SOUNDEX (chỉ thêm fullName SOUNDEX khi được bật)
  const whereOr_soundex = [
    ...fields.map((field) =>
      Sequelize.where(
        Sequelize.fn("SOUNDEX", Sequelize.col(field)),
        Sequelize.fn("SOUNDEX", searchterm)
      )
    ),
  ];

  if (useFullName && fullNameCols.length >= 2) {
    whereOr_soundex.push(
      Sequelize.where(
        Sequelize.fn(
          "SOUNDEX",
          Sequelize.fn(
            "concat",
            Sequelize.col(fullNameCols[0]),
            " ",
            Sequelize.col(fullNameCols[1])
          )
        ),
        Sequelize.fn("SOUNDEX", searchterm)
      )
    );
  }

  result = await model.findAll({
    where: {
      ...baseWhere,
      [Op.or]: whereOr_soundex,
    },
    include,
  });

  if (result.length > 0) {
    return { tag: "resemble", data: result };
  }

  // 3) Resemble: prefix (LIKE searchterm%)
  const whereOr_prefix = [
    ...fields.map((field) => ({
      [field]: { [Op.like]: `${searchterm}%` },
    })),
  ];

  if (useFullName && fullNameCols.length >= 2) {
    whereOr_prefix.push(
      Sequelize.where(
        Sequelize.fn(
          "concat",
          Sequelize.col(fullNameCols[0]),
          " ",
          Sequelize.col(fullNameCols[1])
        ),
        { [Op.like]: `${searchterm}%` }
      )
    );
  }

  result = await model.findAll({
    where: {
      ...baseWhere,
      [Op.or]: whereOr_prefix,
    },
    include,
  });

  if (result.length > 0) {
    return { tag: "resemble", data: result };
  }

  return { tag: "none", data: [] };
};

// -------------------------
// Các hàm search cụ thể (giữ nguyên)
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

// -------------------------
// searchDoctor: gọi searchWithFallback cho User với useFullName = true
let searchDoctor = async (searchterm) => {
  // Include Doctor_infor khi tìm User
  let includeDoctorInfor = {
    model: db.Doctor_infor,
    required: false,
  };

  let userBaseWhere = { roleId: "R2" };

  // 1) Search ở User (BẬT full name concat)
  let userSearch = await searchWithFallback(
    db.User,
    searchterm,
    ["firstName", "lastName", "email"],
    [includeDoctorInfor],
    userBaseWhere,
    { useFullName: true, fullNameCols: ["firstName", "lastName"] }
  );

  if (userSearch.tag !== "none") {
    // Chuẩn hóa dữ liệu => wrap lại thành { User: item }
    return {
      tag: userSearch.tag,
      data: userSearch.data.map((u) => ({
        id: u.id, // giữ id để render key
        User: u, // đặt User = chính object User
        Doctor_infor: u.Doctor_infor || null,
      })),
    };
  }

  // 2) Search ở Doctor_infor (include User) - giữ nguyên (tìm theo clinic)
  let includeUser = {
    model: db.User,
    where: { roleId: "R2" },
    attributes: ["id", "firstName", "lastName", "email", "image"],
    required: false,
  };

  let doctorSearch = await searchWithFallback(
    db.Doctor_infor,
    searchterm,
    ["clinicAddress", "clinicName"],
    [includeUser]
  );

  if (doctorSearch.tag !== "none") {
    return {
      tag: doctorSearch.tag,
      data: doctorSearch.data.map((d) => ({
        id: d.id,
        User: d.User, // luôn có User vì đã include
        Doctor_infor: d,
      })),
    };
  }

  return { tag: "none", data: [] };
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
