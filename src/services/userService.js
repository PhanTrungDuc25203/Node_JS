import db from "../models/index";
//trong file này có phần so sánh password để kiểm tra người dùng
//nên cần so sánh giá trị băm của password chứ không phải pass thuần
//nên cần thư viện ở dưới
import bcrypt from "bcryptjs";
import moment from "moment";

const salt = bcrypt.genSaltSync(10);

let hashUserPassword = (password) => {
    return new Promise(async (resolve, reject) => {
        try {
            let hashPassword = await bcrypt.hashSync(password, salt);
            resolve(hashPassword);
        } catch (e) {
            reject(e);
        }
    });
};

let handleUserLogin = (email, password) => {
    return new Promise(async (resolve, reject) => {
        try {
            let userData = {};
            let isExist = await checkUserEmail(email);
            if (isExist) {
                //có tồn taị người dùng
                //sau đó cần so sánh password xem có giống nhau không mới cho đăng nhập
                let user = await db.User.findOne({
                    attributes: ["email", "roleId", "password", "firstName", "lastName"],
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
                        userData.errMessage = "Login succesfully";
                        //vì giải thích ở trên nói vẫn lấy pass nên ở đây nên xóa thuộc tính pass
                        //của đối tượng user đi rồi mới trả về cho userData

                        //trước khi sử dụng câu lệnh này thì nên lấy dữ liệu ở dạng raw
                        delete user.password;
                        userData.user = user;
                    } else {
                        userData.errCode = 2;
                        userData.errMessage = "Wrong pasword";
                    }
                } else {
                    userData.errCode = 1;
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
    });
};

let checkUserEmail = (userEmail) => {
    return new Promise(async (resolve, reject) => {
        try {
            let user = await db.User.findOne({
                where: {
                    email: userEmail,
                    password: { [db.Sequelize.Op.ne]: "" },
                },
            });
            if (user) {
                resolve(true);
            } else {
                resolve(false);
            }
        } catch (e) {
            reject(e);
        }
    });
};

let getAllUsersForReact = (userId) => {
    //tham số truyền vào userId ở đây là id người dùng hoặc all như quy định bên userController.js
    return new Promise(async (resolve, reject) => {
        try {
            let users = "";
            //trả về ít thông tin người dùng thôi không lộ hết:))
            if (userId === "ALL") {
                users = db.User.findAll({
                    attributes: {
                        exclude: ["password"],
                    },
                });
            }
            if (userId && userId !== "ALL") {
                users = await db.User.findOne({
                    where: { id: userId },
                    attributes: {
                        exclude: ["password"],
                    },
                });
            }

            resolve(users);
        } catch (e) {
            reject(e);
        }
    });
};

let createNewUserInReact = (data) => {
    //data cuả hàm này đươcj gửi từ client
    return new Promise(async (resolve, reject) => {
        try {
            //check sự tồn tại của email
            let check = await checkUserEmail(data.email);
            if (check) {
                resolve({
                    errCode: 1,
                    message: "User has already been exist!",
                });
            } else {
                let hashPasswordFromBcrypt = await hashUserPassword(data.password);

                // Tìm người dùng dựa trên email
                let existingUser = await db.User.findOne({
                    where: { email: data.email },
                });

                if (existingUser) {
                    // Nếu người dùng đã tồn tại, cập nhật thông tin
                    await db.User.update(
                        {
                            password: hashPasswordFromBcrypt,
                            firstName: data.firstName,
                            lastName: data.lastName,
                            address: data.address,
                            phoneNumber: data.phoneNumber,
                            gender: data.gender,
                            image: data.image, // Cập nhật image nếu cần
                            roleId: data.roleId,
                            positionId: data.positionId,
                        },
                        {
                            where: { email: data.email },
                        }
                    );

                    resolve({
                        errCode: 0,
                        message: "Update user successfully!",
                    });
                } else {
                    // Nếu người dùng không tồn tại, tạo mới
                    await db.User.create({
                        email: data.email,
                        password: hashPasswordFromBcrypt,
                        firstName: data.firstName,
                        lastName: data.lastName,
                        address: data.address,
                        phoneNumber: data.phoneNumber,
                        gender: data.gender,
                        image: data.image, // Gán giá trị cho image
                        roleId: data.roleId,
                        positionId: data.positionId,
                    });

                    resolve({
                        errCode: 0,
                        message: "Create user successfully!",
                    });
                }
            }
        } catch (e) {
            reject(e);
        }
    });
};

let editUserInReact = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            //ở dự án react có 2 crud là gọi api thuần và api thông qua redux, code ở dưới là
            //gọi api thuần, code đang chạy là api thông qua redux, nếu muốn dùng chức năng
            //thuần thì đổi chỗ 2 đoạn code if này
            // if (!data.id) {
            if (!data.id || !data.roleId || !data.positionId || !data.gender) {
                resolve({
                    errCode: 2,
                    errMessage: "Missing parameters!",
                });
            }
            let user = await db.User.findOne({
                where: { id: data.id },
                //ở file config.json đã chuyển raw:true nên
                //hàm update và delete không thể chạy, khi chạy nhớ chuyển raw: false
                raw: false,
            });
            if (user) {
                user.firstName = data.firstName;
                user.lastName = data.lastName;
                user.address = data.address;
                user.phoneNumber = data.phoneNumber;
                user.gender = data.gender;
                user.roleId = data.roleId;
                user.positionId = data.positionId;
                if (data.image) {
                    user.image = data.image;
                }

                await user.save();
                // await db.User.save({
                //     firstName: data.firstName,
                //     lastName: data.lastName,
                //     address: data.address,
                //     phoneNumber: data.phoneNumber,
                //     gender: data.gender,
                //     roleId: data.roleId,
                // })
                resolve({
                    errCode: 0,
                    message: "User updated!",
                });
            } else {
                resolve({
                    errCode: 1,
                    errMessage: "User is not found!",
                });
            }
        } catch (e) {
            reject(e);
        }
    });
};

let deleteUserInReact = (userIdFromReact) => {
    return new Promise(async (resolve, reject) => {
        //nếu không muốn dài dòng rườm ra thì sử dụng câu lệnh tổ hợp như sau:
        // await db.User.destroy({
        //     where: { id: userIdFromReact }
        // })

        try {
            let user = await db.User.findOne({
                where: { id: userIdFromReact },
                raw: false,
            });
            console.log(user);
            if (!user) {
                resolve({
                    errCode: 2,
                    errMessage: "User is not exist!",
                });
            } else {
                await user.destroy();
                resolve({
                    errCode: 0,
                    message: "User has been deleted successfully",
                });
            }
        } catch (e) {
            reject(e);
        }
    });
};

let getAllCodesDataService = (typeInput) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!typeInput) {
                resolve({
                    errCode: 1,
                    errMessage: "Missing required parameters!",
                });
            } else {
                let res = {};
                //tên db.Allcode không liên quan tới db trong phpmyadmin, nó được định nghĩa bên trong model
                //của project này
                let allCodesData = await db.Allcode.findAll({
                    where: { type: typeInput },
                });
                res.errCode = 0;
                res.data = allCodesData;
                resolve(res);
            }
        } catch (e) {
            reject(e);
        }
    });
};

let getAllRelativeInforsOfCurrentSystemUserService = (currentUserEmail) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!currentUserEmail) {
                resolve({
                    errCode: 1,
                    errMessage: "Missing input parameter: current user email!",
                });
            } else {
                let res = {};
                let userInUserTable = await db.User.findOne({
                    where: { email: currentUserEmail },
                    attributes: {
                        exclude: ["password", "id", "createdAt", "updatedAt"],
                    },
                    include: [
                        {
                            model: db.Allcode,
                            as: "roleData",
                            attributes: ["value_Eng", "value_Vie"],
                        },
                        {
                            model: db.Allcode,
                            as: "positionData",
                            attributes: ["value_Eng", "value_Vie"],
                        },
                        {
                            model: db.Allcode,
                            as: "genderData",
                            attributes: ["value_Eng", "value_Vie"],
                        },
                        // {
                        //     model: db.Booking, as: 'doctorHasAppointmentWithPatients',
                        //     attributes: ['id', 'statusId', 'timeType', 'doctorId', 'patientId', 'date', 'patientPhoneNumber', 'patientAddress', 'patientBirthday', 'patientGender'],
                        //     include: [
                        //         {
                        //             model: db.Allcode, as: 'appointmentTimeTypeData',
                        //             attributes: ['value_Vie', 'value_Eng']
                        //         },
                        //     ]
                        // },
                        // {
                        //     model: db.Booking, as: 'patientHasAppointmentWithDoctors',
                        //     attributes: ['id', 'statusId', 'timeType', 'doctorId', 'patientId', 'date', 'patientPhoneNumber', 'patientAddress', 'patientBirthday', 'patientGender'],
                        //     include: [
                        //         {
                        //             model: db.Allcode, as: 'appointmentTimeTypeData',
                        //             attributes: ['value_Vie', 'value_Eng']
                        //         },
                        //     ]
                        // },
                        {
                            model: db.Doctor_infor,
                            attributes: {
                                exclude: ["id", "doctorId"],
                            },
                            include: [
                                {
                                    model: db.Specialty,
                                    as: "belongToSpecialty",
                                    attributes: ["name"],
                                },
                            ],
                        },
                    ],
                });

                if (userInUserTable) {
                    // Format lại các trường date và patientBirthday
                    if (userInUserTable.doctorHasAppointmentWithPatients) {
                        userInUserTable.doctorHasAppointmentWithPatients.forEach((appointment) => {
                            appointment.date = moment(appointment.date).format("YYYY-MM-DD");
                            appointment.patientBirthday = moment(appointment.patientBirthday).format("YYYY-MM-DD");
                        });
                    }

                    if (userInUserTable.patientHasAppointmentWithDoctors) {
                        userInUserTable.patientHasAppointmentWithDoctors.forEach((appointment) => {
                            appointment.date = moment(appointment.date).format("YYYY-MM-DD");
                            appointment.patientBirthday = moment(appointment.patientBirthday).format("YYYY-MM-DD");
                        });
                    }
                }

                res.errCode = 0;
                res.errMessage = "Get current user informations successfully!";
                res.data = userInUserTable;

                resolve(res);
            }
        } catch (e) {
            reject(e);
        }
    });
};

let getAllRelativeBookingsOfCurrentSystemUserService = (currentUserEmail) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!currentUserEmail) {
                resolve({
                    errCode: 1,
                    errMessage: "Missing input parameter: current user email!",
                });
            } else {
                let res = {};
                let allBookingsOfCurrentUser = await db.User.findOne({
                    where: { email: currentUserEmail },
                    attributes: {
                        exclude: ["password", "id", "createdAt", "updatedAt", "firstName", "lastName", "address", "gender", "phoneNumber", "image", "roleId", "positionId"],
                    },
                    include: [
                        {
                            model: db.Booking,
                            as: "doctorHasAppointmentWithPatients",
                            attributes: ["id", "statusId", "timeType", "doctorId", "patientId", "date", "patientPhoneNumber", "patientAddress", "patientBirthday", "patientGender"],
                            include: [
                                {
                                    model: db.Allcode,
                                    as: "appointmentTimeTypeData",
                                    attributes: ["value_Vie", "value_Eng"],
                                },
                            ],
                        },
                        {
                            model: db.Booking,
                            as: "patientHasAppointmentWithDoctors",
                            attributes: ["id", "statusId", "timeType", "doctorId", "patientId", "date", "patientPhoneNumber", "patientAddress", "patientBirthday", "patientGender"],
                            include: [
                                {
                                    model: db.Allcode,
                                    as: "appointmentTimeTypeData",
                                    attributes: ["value_Vie", "value_Eng"],
                                },
                            ],
                        },
                    ],
                });

                res.errCode = 0;
                res.errMessage = "Get current user bookings successfully!";
                res.data = allBookingsOfCurrentUser;

                resolve(res);
            }
        } catch (e) {
            reject(e);
        }
    });
};

let saveRateAndReviewAboutDoctorService = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.userEmail || !data.doctorEmail || !data.appointmentId || !data.rating) {
                return resolve({
                    errCode: 1,
                    errMessage: "Missing input parameter: userEmail; doctorEmail; appointmentId; rating!",
                });
            }

            let bookedAppointment = await db.Booking.findOne({
                where: { id: data.appointmentId },
                attributes: {
                    exclude: ["timeType", "date", "patientPhoneNumber", "patientBirthday", "patientAddress", "patientGender", "token", "createdAt", "updatedAt"],
                },
            });

            console.log("Check: ", bookedAppointment);

            if (!bookedAppointment || bookedAppointment.statusId !== "S3") {
                return resolve({
                    errCode: 2,
                    errMessage: "Appointment not found or not valid to review!",
                });
            }

            const rateAndReviewData = {
                userId: bookedAppointment.patientId,
                userEmail: data.userEmail,
                doctorId: bookedAppointment.doctorId,
                doctorEmail: data.doctorEmail,
                packageId: "",
                packageName: "",
                appointmentId: bookedAppointment.id,
                paidPackageId: "",
                rating: data.rating,
                content: data.content && data.content.trim() !== "" ? data.content : null,
                images: data.images ? (data.images.length > 0 ? JSON.stringify(data.images) : null) : null,
            };

            let existingReview = await db.DoctorPackageRate.findOne({
                where: { appointmentId: bookedAppointment.id },
            });

            if (!existingReview) {
                await db.DoctorPackageRate.create(rateAndReviewData);
                return resolve({
                    errCode: 0,
                    message: "Save rate and review about doctor successfully!",
                });
            } else {
                let createdTime = new Date(existingReview.createdAt);
                let now = new Date();
                let diffHours = (now - createdTime) / (1000 * 60 * 60);

                if (diffHours <= 24) {
                    await existingReview.update(rateAndReviewData);
                    return resolve({
                        errCode: 0,
                        message: "Update rate and review about doctor successfully!",
                    });
                } else {
                    return resolve({
                        errCode: 3,
                        errMessage: "You can only update your review within 1 day after posting!",
                    });
                }
            }
        } catch (e) {
            reject(e);
        }
    });
};

let getRateAndReviewAboutDoctorService = (appointmentId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!appointmentId) {
                resolve({
                    errCode: 1,
                    errMessage: "Missing input parameter: appointmentId!",
                });
            } else {
                let res = {};
                let data = await db.DoctorPackageRate.findOne({
                    where: { appointmentId: appointmentId },
                });
                res.errCode = 0;
                res.data = data;
                resolve(res);
            }
        } catch (e) {
            reject(e);
        }
    });
};

module.exports = {
    handleUserLogin: handleUserLogin,
    checkUserEmail: checkUserEmail,
    getAllUsersForReact: getAllUsersForReact,
    createNewUserInReact: createNewUserInReact,
    deleteUserInReact: deleteUserInReact,
    editUserInReact: editUserInReact,
    getAllCodesDataService: getAllCodesDataService,
    getAllRelativeInforsOfCurrentSystemUserService: getAllRelativeInforsOfCurrentSystemUserService,
    getAllRelativeBookingsOfCurrentSystemUserService: getAllRelativeBookingsOfCurrentSystemUserService,
    saveRateAndReviewAboutDoctorService: saveRateAndReviewAboutDoctorService,
    getRateAndReviewAboutDoctorService: getRateAndReviewAboutDoctorService,
};
