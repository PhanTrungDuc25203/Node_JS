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

module.exports = {
    createMedicalFacility: createMedicalFacility,
}