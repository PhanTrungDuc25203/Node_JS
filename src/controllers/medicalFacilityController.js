import medicalFacilityService from "../services/medicalFacilityService";

let createMedicalFacility = async (req, res) => {
    try {
        let infor = await medicalFacilityService.createMedicalFacilityService(req.body);
        return res.status(200).json(infor);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: "Create medical facility data fail from server!",
        })
    }
}

let getInfoOfMedicalFacility = async (req, res) => {
    try {
        let id = req.query.id;
        if (!id) {
            return res.status(200).json({
                errCode: 1,
                errMessage: 'Missing required parameters!',
                medicalFacility: []
            });
        } else {
            let infor = await medicalFacilityService.getInfoOfMedicalFacilityService(id);
            return res.status(200).json(
                {
                    errCode: 0,
                    errMessage: 'Get brief info of medical facility successfully!',
                    infor
                }
            );
        }
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: "Get brief info of medical facility fail from server!",
        })
    }
}

let createExamPackage = async (req, res) => {
    try {
        let infor = await medicalFacilityService.createExamPackageService(req.body);
        return res.status(200).json(infor);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: "Create exam package data fail from server!",
        })
    }
}

let createTimeframesForExamPackageSchedule = async (req, res) => {
    try {
        let infor = await medicalFacilityService.bulkCreateTimeframesForExamPackageScheduleService(req.body);
        return res.status(200).json(infor);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: "Create timeframes for Doctor schedule fail from server!",
        })
    }
}

let getAllExamPackage = async (req, res) => {
    try {
        let infor = await medicalFacilityService.getAllExamPackageService(req.query.id);
        return res.status(200).json(
            {
                errCode: 0,
                errMessage: 'Get info of exam package successfully!',
                infor
            }
        );
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: "Get all exam package information fail from server!",
        })
    }
}

let getPackageScheduleByDate = async (req, res) => {
    try {
        console.log("Check parameter: ", req.query.packageId, req.query.date);
        let infor = await medicalFacilityService.getPackageScheduleByDateService(req.query.packageId, req.query.date);
        return res.status(200).json(infor);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Get schedule by date for a package error from server!',
        })
    }
}

let patientInforWhenBookingExamPackage = async (req, res) => {
    try {
        let infor = await medicalFacilityService.patientInforWhenBookingExamPackageService(req.body);
        return res.status(200).json(infor);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Save booking form error from server!',
        })
    }
}

module.exports = {
    createMedicalFacility: createMedicalFacility,
    getInfoOfMedicalFacility: getInfoOfMedicalFacility,
    createExamPackage: createExamPackage,
    createTimeframesForExamPackageSchedule: createTimeframesForExamPackageSchedule,
    getAllExamPackage: getAllExamPackage,
    getPackageScheduleByDate: getPackageScheduleByDate,
    patientInforWhenBookingExamPackage: patientInforWhenBookingExamPackage,
}