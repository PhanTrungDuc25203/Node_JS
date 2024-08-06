import db from "../models/index";
//trong file này có phần so sánh password để kiểm tra người dùng
//nên cần so sánh giá trị băm của password chứ không phải pass thuần
//nên cần thư viện ở dưới
import bcrypt from 'bcryptjs';

let handleUserLogin = (email, password) => {
    return new Promise(async (resolve, reject) => {
        try {
            let userData = {

            }
            let isExist = await checkUserEmail(email);
            if (isExist) {
                //có tồn taị người dùng
                //sau đó cần so sánh password xem có giống nhau không mới cho đăng nhập
                let user = await db.User.findOne({
                    attributes: ['email', 'roleId', 'password'],
                    where: { email: email },
                    //chỉ lấy ra một số trường thuộc tính cần thiết của User
                    //không nên lấy hết vì lộ thông tin
                    //nhưng vì nếu bỏ pass thì ko check đc pass nên vẫn lấy:))


                    //trả lại dữ liệu raw vì thế thì câu lệnh xóa một thuộc tính 
                    //của đối tượng mới hoạt động
                    raw: true,

                });
                //tại sao ta vẫn cần phải check người dùng có tồn tại hay không một 
                //lần nữa tại đây?
                //vì web là chương trình cần chứ ý tới phiên hoạt động, có thể khi người 
                //dùng này gửi request rồi, chương trình đã chạy xong câu lệnh check thứ 
                //nhất bên trên rồi nhưng chưa kịp chạy câu lệnh check thứ 2 ngay sau đây
                //nên người dùng sẽ bị từ chối, hơn nữa việc người dùng nhập email và pass
                //thực sự có một khoảng thời gian trống lớn
                //vậy nên ta cần check một lần nữa tại đây
                if (user) {
                    let check = await bcrypt.compareSync(password, user.password);
                    if (check) {
                        userData.errCode = 0;
                        userData.errMessage = 'Login succesfully';
                        //vì giải thích ở trên nói vẫn lấy pass nên ở đây nên xóa thuộc tính pass
                        //của đối tượng user đi rồi mới trả về cho userData

                        //trước khi sử dụng câu lệnh này thì nên lấy dữ liệu ở dạng raw
                        delete user.password;
                        userData.user = user;
                    } else {
                        userData.errCode = 0;
                        userData.errMessage = 'Wrong pasword';
                    }
                } else {
                    userData.errCode = 2;
                    userData.errMessage = `User not found`;
                }
            } else {
                userData.errCode = 1;
                userData.errMessage = `User not found`;
            }
            resolve(userData);
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