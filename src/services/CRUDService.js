import bcrypt from 'bcryptjs'
import db from '../models/index'

const salt = bcrypt.genSaltSync(10);

let createNewUser = async (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            let hashPasswordFromBcrypt = await hashUserPassword(data.password);
            await db.User.create({
                email: data.email,
                password: hashPasswordFromBcrypt,
                firstName: data.firstName,
                lastName: data.lastName,
                address: data.address,
                phoneNumber: data.phoneNumber,
                gender: data.gender,
                //vì chưa có chỗ nhập image và position nên tôi sẽ để là một string bất kì thôi
                image: "DataTypes.STRING",
                roleId: data.roleId,
                positionId: "DataTypes.STRING",
            })
            resolve('Create new user succesfully!');
        } catch (e) {
            reject(e);
        }
    });

    console.log('data from service!!');
    console.log(data);
    console.log(hashPasswordFromBcrypt);
}

let hashUserPassword = (password) => {
    return new Promise(async (resolve, reject) => {
        try {
            let hashPassword = await bcrypt.hashSync(password, salt);
            resolve(hashPassword);
        } catch (e) {
            reject(e);
        }
    })
}
let getAllUser = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let users = db.User.findAll({
                // thêm thuộc tính raw:true để chỉ lấy dữ liệu thôi không lấy nhưngx thông tin 
                // khác về các thuộc tính của đối tượng nữa, chỉ lấy thông tin đối tượng
                raw: true,
            });
            resolve(users);
        } catch (e) {
            reject(e);
        }
    })
}
module.exports = {
    createNewUser: createNewUser,
    getAllUser: getAllUser,
}