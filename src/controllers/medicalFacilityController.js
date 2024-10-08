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

module.exports = {
    createMedicalFacility: createMedicalFacility,
    getInfoOfMedicalFacility: getInfoOfMedicalFacility,
}