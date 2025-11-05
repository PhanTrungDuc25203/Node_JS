import vnpayService from "../services/vnpayService";

let createVnpayPaymentUrl = async (req, res) => {
    try {
        let result = await vnpayService.createVnpayPaymentUrlService(req);
        return res.status(200).json(result);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            message: "Create vnpay payment url error from server!",
        });
    }
};

module.exports = {
    createVnpayPaymentUrl,
};