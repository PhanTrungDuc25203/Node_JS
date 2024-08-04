import db from "../models/index";

let handleUserLogin = (email, password) => {
    return new Promise(async (resolve, reject) => {
        try {
            let userData = {

            }
            let isExist = await checkUserEmail(email);
            if (isExist) {
                //có tồn taị người dùng
                //sau đó cần so sánh password xem có giống nhau không mới cho đăng nhập
                resolve()
            } else {
                userData.errCode = 1;
                userData.errMessage = `Invalid email or password`;
                resolve(userData)
                //trả về mã lỗi
            }
        } catch (e) {
            reject(e);
        }
    })
}
let checkUserEmail = (userEmail) => {
    return new Promise(async (resolve, reject) => {
        try {
            let user = await db.User.findOne({
                where: { email: userEmail }
            })
            if (user) {
                resolve(true);
            } else {
                resolve(false);
            }
        } catch (e) {
            reject(e);
        }
    })
}
module.exports = {
    handleUserLogin: handleUserLogin,
}