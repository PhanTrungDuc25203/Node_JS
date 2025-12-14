import staffService from "../services/staffService";

let createResultTemplate = async (req, res) => {
    try {
        let response = await staffService.createResultTemplateService(req.body);
        return res.status(200).json(response);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: "Create exam package result template error from server!",
        });
    }
};

let getResultPendingExamPackage = async (req, res) => {
    try {
        let response = await staffService.getResultPendingExamPackageService(req.query.medicalFacilityId);
        return res.status(200).json(response);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: "Get all exam packages had pending result error from server!",
        });
    }
};

let saveExamPackageResult = async (req, res) => {
    try {
        let response = await staffService.saveExamPackageResultService(req.body);
        return res.status(200).json(response);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: "Save exam package result error from server!",
        });
    }
};

let getExamPackageResult = async (req, res) => {
    try {
        let response = await staffService.getExamPackageResultService(req.query.bookingId);
        return res.status(200).json(response);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: "Get exam package result error from server!",
        });
    }
};

let getStaffInfo = async (req, res) => {
    try {
        let info = await staffService.getStaffInfoService(req.query.id);
        return res.status(200).json(info);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: "Get staff info error from server!",
        });
    }
};

module.exports = {
    createResultTemplate: createResultTemplate,
    getResultPendingExamPackage: getResultPendingExamPackage,
    saveExamPackageResult: saveExamPackageResult,
    getExamPackageResult: getExamPackageResult,
    getStaffInfo: getStaffInfo,
};
