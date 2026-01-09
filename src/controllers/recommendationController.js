import recommendationService from "../services/recommendationService";

let recommendDoctorsForPatientController = async (req, res) => {
    try {
        let { patientId } = req.query;
        let result = await recommendationService.recommendDoctorsForPatientService(patientId);
        return res.status(200).json(result);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            message: "Get appropriate doctors error from server!",
        });
    }
};

let recommendPackagesForPatientController = async (req, res) => {
    try {
        let { patientId } = req.query;
        let result = await recommendationService.recommendPackagesForPatientService(patientId);
        return res.status(200).json(result);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            message: "Get appropriate packages error from server!",
        });
    }
};

module.exports = {
    recommendDoctorsForPatientController: recommendDoctorsForPatientController,
    recommendPackagesForPatientController: recommendPackagesForPatientController,
};
