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

module.exports = {
    recommendDoctorsForPatientController: recommendDoctorsForPatientController,
};
