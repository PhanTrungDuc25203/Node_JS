import specialtyService from "../services/specialtyService";

let createSpecialty = async (req, res) => {
    try {
        let infor = await specialtyService.createSpecialtyService(req.body);
        return res.status(200).json(infor);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Create new specialty error from server!',
        });
    }
}

module.exports = {
    createSpecialty: createSpecialty,
}