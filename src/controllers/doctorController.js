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

module.exports = {
    getEliteDoctorForHomePage: getEliteDoctorForHomePage,
}