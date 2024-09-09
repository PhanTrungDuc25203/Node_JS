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

let getSpecialtyForHomePage = async (req, res) => {
    try {
        let response = await specialtyService.getSpecialtyForHomePageService();
        return res.status(200).json(response);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            message: 'Get specialties error from server!'
        })
    }
}

module.exports = {
    createSpecialty: createSpecialty,
    getSpecialtyForHomePage: getSpecialtyForHomePage,
}