import specialtyService from "../services/specialtyService";

let createSpecialty = async (req, res) => {
  try {
    let infor = await specialtyService.createSpecialtyService(req.body);
    return res.status(200).json(infor);
  } catch (e) {
    console.log(e);
    return res.status(200).json({
      errCode: -1,
      errMessage: "Create new specialty error from server!",
    });
  }
};

let getSpecialtyForHomePage = async (req, res) => {
  try {
    let response = await specialtyService.getSpecialtyForHomePageService();
    return res.status(200).json(response);
  } catch (e) {
    console.log(e);
    return res.status(200).json({
      errCode: -1,
      message: "Get specialties error from server!",
    });
  }
};

let getRemoteSpecialtyForHomePage = async (req, res) => {
  try {
    let response =
      await specialtyService.getRemoteSpecialtyForHomePageService();
    return res.status(200).json(response);
  } catch (e) {
    console.log(e);
    return res.status(200).json({
      errCode: -1,
      message: "Get remote specialties error from server!",
    });
  }
};

let getSpecialtyById = async (req, res) => {
  try {
    let infor = await specialtyService.getSpecialtyByIdService(
      req.query.id,
      req.query.location
    );
    return res.status(200).json(infor);
  } catch (e) {
    console.log(e);
    return escapeRegExp.status(200).json({
      errCode: -1,
      errMessage: "Get specialty detail by id error from server!",
    });
  }
};

let getSpecialtyAndProvinceForMedicalFacilityManagePage = async (req, res) => {
  try {
    let infor =
      await specialtyService.getSpecialtyAndProvinceForMedicalFacilityManagePageService();
    return res.status(200).json(infor);
  } catch (e) {
    console.log(e);
    return escapeRegExp.status(200).json({
      errCode: -1,
      errMessage: "Get specialty detail error from server!",
    });
  }
};

module.exports = {
  createSpecialty: createSpecialty,
  getSpecialtyForHomePage: getSpecialtyForHomePage,
  getSpecialtyById: getSpecialtyById,
  getSpecialtyAndProvinceForMedicalFacilityManagePage:
    getSpecialtyAndProvinceForMedicalFacilityManagePage,
  getRemoteSpecialtyForHomePage: getRemoteSpecialtyForHomePage,
};
