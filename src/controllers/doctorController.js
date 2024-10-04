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

let getScheduleByDate = async (req, res) => {
    try {
        console.log("Check parameter: ", req.query.doctorId, req.query.date);
        let infor = await doctorService.getScheduleByDateService(req.query.doctorId, req.query.date);
        return res.status(200).json(infor);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Get schedule by date for a doctor error from server!',
        })
    }
}

let getExtraInforDoctorByID = async (req, res) => {
    try {
        let infor = await doctorService.getExtraInforDoctorByIDService(req.query.doctorId);
        return res.status(200).json(infor);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Get extra infor doctor error from server!',
        })
    }
}

let saveAppointmentHistory = async (req, res) => {
    try {
        let infor = await doctorService.saveAppointmentHistoryService(req.body);
        return res.status(200).json(infor);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: "Save appointment history fail from server!",
        })
    }
}

let getAppointmentHistoriesByDoctorEmail = async (req, res) => {
    try {
        console.log("check doctor email:", req.query.doctorEmail);
        let infor = await doctorService.getAppointmentHistoriesByDoctorEmailService(req.query.doctorEmail);
        return res.status(200).json(infor);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: "Get histories data fail from server!",
        })
    }
}

module.exports = {
    getEliteDoctorForHomePage: getEliteDoctorForHomePage,
    getAllDoctorsForDoctorArticlePage: getAllDoctorsForDoctorArticlePage,
    saveInforAndArticleOfADoctor: saveInforAndArticleOfADoctor,
    getParticularInforForDoctorPage: getParticularInforForDoctorPage,
    createTimeframesForDoctorSchedule: createTimeframesForDoctorSchedule,
    getScheduleByDate: getScheduleByDate,
    getExtraInforDoctorByID: getExtraInforDoctorByID,
    saveAppointmentHistory: saveAppointmentHistory,
    getAppointmentHistoriesByDoctorEmail: getAppointmentHistoriesByDoctorEmail,
}