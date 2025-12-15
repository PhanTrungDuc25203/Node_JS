import patientService from "../services/patientService";

let patientInforWhenBookingTime = async (req, res) => {
    try {
        let io = req.app.get("io");
        let infor = await patientService.patientInforWhenBookingTimeService(req.body, io);
        return res.status(200).json(infor);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: "Save booking form error from server!",
        });
    }
};

let confirmBookingAppointment = async (req, res) => {
    try {
        let admit = await patientService.confirmBookingAppointmentService(req.body);
        return res.status(200).json(admit);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: "Save booking form error from server!",
        });
    }
};
let confirmBookingExamPackage = async (req, res) => {
    try {
        let admit = await patientService.confirmBookingExamPackageService(req.body);
        return res.status(200).json(admit);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: "Save booking exam package form error from server!",
        });
    }
};

let getAppointmentHistoriesByPatientEmail = async (req, res) => {
    try {
        console.log("check patient email:", req.query.patientEmail);
        let infor = await patientService.getAppointmentHistoriesByPatientEmailService(req.query.patientEmail);
        return res.status(200).json(infor);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: "Get histories data fail from server!",
        });
    }
};

let getPatientAppointmentsOverviewStatistics = async (req, res) => {
    try {
        let statistic = await patientService.getPatientAppointmentsOverviewStatisticsService(req.query.patientId);
        return res.status(200).json(statistic);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: "Get patient's appointments overview statistic fail from server!",
        });
    }
};

let getPatientAppointmentsNearest = async (req, res) => {
    try {
        let data = await patientService.getPatientAppointmentsNearestService(req.query.patientId);
        return res.status(200).json(data);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: "Get patient's nearest appointments fail from server!",
        });
    }
};

let getPatientAppointmentsMonthlyVisits = async (req, res) => {
    try {
        let data = await patientService.getPatientAppointmentsMonthlyVisitsService(req.query.patientId);
        return res.status(200).json(data);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: "Get patient's monthly visits fail from server!",
        });
    }
};

let getPatientFrequentVisitsMedicalFacilitiesAndDoctors = async (req, res) => {
    try {
        let data = await patientService.getPatientFrequentVisitsMedicalFacilitiesAndDoctorsService(req.params.patientId);
        return res.status(200).json(data);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: "Get patient's monthly visits fail from server!",
        });
    }
};

let getPatientExamPackageTime = async (req, res) => {
    try {
        let data = await patientService.getPatientExamPackageTimeService(req.query.patientId);
        return res.status(200).json(data);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: "Get patient's exam package time error from server!",
        });
    }
};

module.exports = {
    patientInforWhenBookingTime: patientInforWhenBookingTime,
    confirmBookingAppointment: confirmBookingAppointment,
    confirmBookingExamPackage: confirmBookingExamPackage,
    getAppointmentHistoriesByPatientEmail: getAppointmentHistoriesByPatientEmail,
    getPatientAppointmentsOverviewStatistics: getPatientAppointmentsOverviewStatistics,
    getPatientAppointmentsNearest: getPatientAppointmentsNearest,
    getPatientAppointmentsMonthlyVisits: getPatientAppointmentsMonthlyVisits,
    getPatientFrequentVisitsMedicalFacilitiesAndDoctors: getPatientFrequentVisitsMedicalFacilitiesAndDoctors,
    getPatientExamPackageTime: getPatientExamPackageTime,
};
