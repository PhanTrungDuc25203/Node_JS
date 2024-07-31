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
let getUserInformationById = (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let user = await db.User.findOne({
                where: { id: userId },
                raw: true,
            });

            if (user) {
                resolve(user);
            } else {
                resolve({});
            };
        } catch (e) {
            reject(e);
        }
    })
}
let updateUserData = (data) => {

    return new Promise(async (resolve, reject) => {
        try {
            let user = await db.User.findOne({
                where: { id: data.id }
            })
            if (user) {
                user.firstName = data.firstName;
                user.lastName = data.lastName;
                user.address = data.address;
                user.phoneNumber = data.phoneNumber;
                user.gender = data.gender;
                user.roleId = data.roleId;
                await user.save();

                let allUsers = await db.User.findAll();
                resolve(allUsers);
            } else {
                resolve();
            }
        } catch (e) {
            console.log(e);
        }
    })
}
module.exports = {
    createNewUser: createNewUser,
    getAllUser: getAllUser,
    getUserInformationById: getUserInformationById,
    updateUserData: updateUserData,
}