import doctorService from "../services/doctorService";

let getEliteDoctorForHomePage = async (req, res) => {
    let limitEliteDoctor = req.query.limitEliteDoctor;
    if (!limitEliteDoctor) {
        limitEliteDoctor = 10;
    }
    try {
        //dấu cộng ở tham số truyền vaò kia sẽ giúp String -> int
        let response = await doctorService.getEliteDoctorForHomePage(+limitEliteDoctor);
        return res.status(200).json(response);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            message: 'Get elite doctor error from server!'
        })
    }
}

let getAllDoctorsForDoctorArticlePage = async (req, res) => {
    try {
        let doctors = await doctorService.getAllDoctorsForDoctorArticlePage();
        return res.status(200).json(doctors);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Get doctors for doctorArticle page error!'
        })
    }
}

let saveInforAndArticleOfADoctor = async (req, res) => {
    try {
        let response = await doctorService.saveInforAndArticleOfADoctorService(req.body);
        return res.status(200).json(response);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: `Save doctor's infor and article error!`
        })
    }
}

let getParticularInforForDoctorPage = async (req, res) => {
    try {
        let infor = await doctorService.getParticularInforForDoctorPage(req.query.id);
        return res.status(200).json(infor);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: "Get particular doctor infor error from server!",
        })
    }
}

let createTimeframesForDoctorSchedule = async (req, res) => {
    try {
        let infor = await doctorService.bulkCreateTimeframesForDoctorService(req.body);
        return res.status(200).json(infor);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: "Create timeframes for Doctor schedule fail from server!",
        })
    }
}

module.exports = {
    getEliteDoctorForHomePage: getEliteDoctorForHomePage,
    getAllDoctorsForDoctorArticlePage: getAllDoctorsForDoctorArticlePage,
    saveInforAndArticleOfADoctor: saveInforAndArticleOfADoctor,
    getParticularInforForDoctorPage: getParticularInforForDoctorPage,
    createTimeframesForDoctorSchedule: createTimeframesForDoctorSchedule,
}