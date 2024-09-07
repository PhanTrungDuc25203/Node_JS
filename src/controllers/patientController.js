import patientService from "../services/patientService";

let patientInforWhenBookingTime = async (req, res) => {
    try {
        let infor = await patientService.patientInforWhenBookingTimeService(req.body);
        return res.status(200).json(infor);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Save booking form error from server!',
        })
    }
}

let confirmBookingAppointment = async (req, res) => {
    try {
        let admit = await patientService.confirmBookingAppointmentService(req.body);
        return res.status(200).json(admit);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Save booking form error from server!',
        })
    }
}

module.exports = {
    patientInforWhenBookingTime: patientInforWhenBookingTime,
    confirmBookingAppointment: confirmBookingAppointment,
}