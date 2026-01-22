import { resolveInclude } from "ejs";
import db from "../models/index";
import bcrypt from "bcryptjs";
require("dotenv").config();
import _ from "lodash";
import moment from "moment";
import { where } from "sequelize";
import sendConfirmBookingEmailService from "./sendConfirmBookingEmailService";
import { v4 as uuidv4 } from "uuid";

const TIMEFRAME_MAP = {
    T1: "08:00",
    T2: "09:00",
    T3: "10:00",
    T4: "11:00",
    T5: "13:00",
    T6: "14:00",
    T7: "15:00",
    T8: "16:00",
};

let buildUrlConfirmMedicalRecord = (doctorId, token) => {
    let result = `${process.env.URL_REACT_SERVER}/confirm-booking?token=${token}&doctorId=${doctorId}`;
    return result;
};

let buildUrlPaymentPage = (doctorId, token) => {
    let result = `${process.env.URL_REACT_SERVER}/booking-payment?token=${token}&doctorId=${doctorId}`;
    return result;
};

// let patientInforWhenBookingTimeService = async (data) => {
//     try {
//         // ===== 1. Check missing parameters =====
//         if (!data.email || !data.doctorId || !data.timeType || !data.date || !data.fullname || !data.appointmentMoment) {
//             return {
//                 errCode: 1,
//                 errMessage: `Missing parameter(s)!`,
//             };
//         }

//         // Lấy thông tin user theo email
//         let user = await db.User.findOne({
//             where: { email: data.email },
//             raw: true,
//         });

//         if (!user) {
//             return {
//                 errCode: 1,
//                 errMessage: "Tài khoản không tồn tại!",
//             };
//         }

//         // ===== 2. Kiểm tra xung đột lịch hẹn =====

//         // Check ❶: Người dùng đã có lịch với chính bác sĩ này cùng ngày
//         let conflictSameDoctor = await db.Booking.findOne({
//             where: {
//                 patientId: user.id,
//                 doctorId: data.doctorId,
//                 date: data.date,
//                 statusId: { [db.Sequelize.Op.ne]: "S3" },
//             },
//         });
//         if (conflictSameDoctor) {
//             return {
//                 errCode: 2,
//                 errMessage: `Bạn đã có lịch hẹn với bác sĩ này trong ngày này rồi!`,
//             };
//         }

//         // Check ❷: Người dùng đã đặt lịch cùng timeType + cùng ngày nhưng với bác sĩ khác
//         let conflictSameTime = await db.Booking.findOne({
//             where: {
//                 patientId: user.id,
//                 doctorId: { [db.Sequelize.Op.ne]: data.doctorId },
//                 date: data.date,
//                 timeType: data.timeType,
//                 statusId: { [db.Sequelize.Op.ne]: "S3" },
//             },
//         });

//         if (conflictSameTime) {
//             return {
//                 errCode: 3,
//                 errMessage: `Bạn đã có lịch hẹn khác trong cùng thời điểm này rồi!`,
//             };
//         }

//         // ===== 3. Lấy thông tin bác sĩ =====
//         let doctorInfor = await db.User.findOne({
//             where: { id: data.doctorId },
//             attributes: {
//                 exclude: ["id", "email", "password", "address", "phoneNumber", "roleId", "positionId"],
//             },
//             include: [
//                 {
//                     model: db.Doctor_infor,
//                     attributes: ["clinicName", "clinicAddress"],
//                 },
//             ],
//             raw: false,
//         });

//         let token = uuidv4();

//         // ===== 4. Build redirect link =====
//         let redirectLink = data.selectedPaymentMethod === "PM1" ? buildUrlPaymentPage(data.doctorId, token) : buildUrlConfirmMedicalRecord(data.doctorId, token);

//         // ===== 5. Send email =====
//         await sendConfirmBookingEmailService.sendAEmail({
//             receiverEmail: data.email,
//             patientName: data.fullname,
//             time: data.appointmentMoment,
//             doctorName: doctorInfor.lastName + " " + doctorInfor.firstName,
//             clinicName: doctorInfor.Doctor_infor.clinicName,
//             clinicAddress: doctorInfor.Doctor_infor.clinicAddress,
//             language: data.language,
//             redirectLink: redirectLink,
//             isPayment: data.selectedPaymentMethod === "PM1",
//         });

//         // ===== 6. Tách họ tên =====
//         let fullName = data.fullname.trim();
//         let lastSpaceIndex = fullName.lastIndexOf(" ");
//         let firstName = lastSpaceIndex === -1 ? fullName : fullName.slice(lastSpaceIndex + 1);
//         let lastName = lastSpaceIndex === -1 ? "" : fullName.slice(0, lastSpaceIndex);

//         // ===== 7. Tạo bệnh nhân nếu chưa có =====
//         let [patient] = await db.User.findOrCreate({
//             where: { email: data.email },
//             defaults: {
//                 email: data.email,
//                 lastName: lastName,
//                 firstName: firstName,
//                 phoneNumber: data.phoneNumber,
//                 address: data.address,
//                 gender: data.selectedGender,
//                 roleId: "R3",
//             },
//         });
//         if (data.needUpdateProfileInfo === true) {
//             // ===== 7a. Cập nhật các trường còn thiếu =====
//             let updateData = {};
//             if (!patient.gender && data.selectedGender) updateData.gender = data.selectedGender;
//             if (!patient.phoneNumber && data.phoneNumber) updateData.phoneNumber = data.phoneNumber;
//             if (!patient.address && data.address) updateData.address = data.address;

//             if (Object.keys(updateData).length > 0) {
//                 await patient.update(updateData);
//             }
//         }

//         // ===== 8. Lưu booking =====
//         await db.Booking.create({
//             statusId: "S1",
//             doctorId: data.doctorId,
//             patientId: patient.id,
//             date: data.date,
//             timeType: data.timeType,
//             patientPhoneNumber: data.phoneNumber,
//             patientBirthday: data.birthday,
//             patientAddress: data.address,
//             patientGender: data.selectedGender,
//             examReason: data.reason,
//             paymentMethod: data.selectedPaymentMethod || "PM3",
//             paymentStatus: "PT1",
//             paidAmount: 0,
//             token: token,
//         });

//         return {
//             errCode: 0,
//             errMessage: `Booking created successfully!`,
//         };
//     } catch (e) {
//         return {
//             errCode: -1,
//             errMessage: "Server error!",
//         };
//     }
// };

let handlePatientBookingAppointmentService = async (data) => {
    try {
        // ===== 1. Validate input =====
        if (!data.email || !data.doctorId || !data.timeType || !data.date || !data.fullname || !data.appointmentMoment || !data.phoneNumber || !data.address || !data.selectedGender || !data.selectedPaymentMethod) {
            return {
                errCode: 1,
                errMessage: "Missing parameter(s)!",
            };
        }

        // ===== 2. Lấy user (KHÔNG ghi DB) =====
        let user = await db.User.findOne({
            where: { email: data.email },
        });

        if (!user) {
            return {
                errCode: 5,
                errMessage: "Tài khoản không tồn tại!",
            };
        }

        // ===== 3. Check conflict =====
        let conflictSameDoctor = await db.Booking.findOne({
            where: {
                patientId: user.id,
                doctorId: data.doctorId,
                date: data.date,
                statusId: { [db.Sequelize.Op.ne]: "S3" },
            },
        });

        if (conflictSameDoctor) {
            return {
                errCode: 2,
                errMessage: "Bạn đã có lịch hẹn với bác sĩ này trong ngày này rồi!",
            };
        }

        let conflictSameTimeDoctor = await db.Booking.findOne({
            where: {
                patientId: user.id,
                doctorId: { [db.Sequelize.Op.ne]: data.doctorId },
                date: data.date,
                timeType: data.timeType,
                statusId: { [db.Sequelize.Op.ne]: "S3" },
            },
        });

        let conflictSameTimePackage = await db.ExamPackage_booking.findOne({
            where: {
                patientId: user.id,
                date: data.date,
                timeType: data.timeType,
                statusId: { [db.Sequelize.Op.ne]: "S3" },
            },
        });

        if (conflictSameTimeDoctor) {
            return {
                errCode: 3,
                errMessage: "Bạn đã có lịch hẹn với bác sĩ khác tại thời điểm này rồi!",
            };
        }

        if (conflictSameTimePackage) {
            return {
                errCode: 4,
                errMessage: "Bạn đã có lịch khám với gói khám tại thời điểm này rồi!",
            };
        }

        // ===== 4. Chuẩn bị dữ liệu =====
        let token = uuidv4();

        let fullName = data.fullname.trim();
        let lastSpaceIndex = fullName.lastIndexOf(" ");
        let firstName = lastSpaceIndex === -1 ? fullName : fullName.slice(lastSpaceIndex + 1);
        let lastName = lastSpaceIndex === -1 ? "" : fullName.slice(0, lastSpaceIndex);

        // ===== 5. Ghi DB (KHÔNG TRANSACTION) =====

        // 5.1 Tạo hoặc lấy bệnh nhân
        let [patient] = await db.User.findOrCreate({
            where: { email: data.email },
            defaults: {
                email: data.email,
                lastName,
                firstName,
                phoneNumber: data.phoneNumber,
                address: data.address,
                gender: data.selectedGender,
                roleId: "R3",
            },
        });

        // 5.2 Update thông tin nếu cần
        if (data.needUpdateProfileInfo === true) {
            let updateData = {};
            if (!patient.gender && data.selectedGender) updateData.gender = data.selectedGender;
            if (!patient.phoneNumber && data.phoneNumber) updateData.phoneNumber = data.phoneNumber;
            if (!patient.address && data.address) updateData.address = data.address;

            if (Object.keys(updateData).length > 0) {
                await patient.update(updateData);
            }
        }

        // 5.3 Tạo booking
        await db.Booking.create({
            statusId: "S1",
            doctorId: data.doctorId,
            patientId: patient.id,
            date: data.date,
            timeType: data.timeType,
            patientPhoneNumber: data.phoneNumber,
            patientBirthday: data.birthday,
            patientAddress: data.address,
            patientGender: data.selectedGender,
            examReason: data.reason,
            paymentMethod: data.selectedPaymentMethod || "PM3",
            paymentStatus: "PT1",
            paidAmount: 0,
            token,
        });

        // ===== 6. Gửi email =====
        let timeframeData = await db.Allcode.findOne({
            where: { keyMap: data.timeType, type: "TIME" },
        });

        let doctorInfor = await db.User.findOne({
            where: { id: data.doctorId },
            attributes: {
                exclude: ["id", "email", "password", "address", "phoneNumber", "roleId", "positionId"],
            },
            include: [
                { model: db.ArticleMarkdown, attributes: ["htmlContent", "markdownContent", "description"] },
                { model: db.Allcode, as: "positionData", attributes: ["value_Eng", "value_Vie"] },
                {
                    model: db.Doctor_infor,
                    attributes: { exclude: ["id", "doctorId"] },
                    include: [
                        { model: db.Allcode, as: "priceTypeData", attributes: ["value_Eng", "value_Vie"] },
                        { model: db.Allcode, as: "provinceTypeData", attributes: ["value_Eng", "value_Vie"] },
                        { model: db.Allcode, as: "paymentTypeData", attributes: ["value_Eng", "value_Vie"] },
                        { model: db.Specialty, as: "belongToSpecialty", attributes: ["name"] },
                    ],
                },
                {
                    model: db.Doctor_specialty_medicalFacility,
                    attributes: { exclude: ["id", "createdAt", "updatedAt"] },
                    include: [
                        {
                            model: db.ComplexMedicalFacility,
                            as: "medicalFacilityDoctorAndSpecialty",
                            attributes: ["id", "name", "address"],
                        },
                    ],
                },
            ],
        });

        let redirectLink = data.selectedPaymentMethod === "PM1" ? buildUrlPaymentPage(data.doctorId, token) : buildUrlConfirmMedicalRecord(data.doctorId, token);

        await sendConfirmBookingEmailService.sendAEmail({
            receiverEmail: data.email,
            patientName: data.fullname,
            time: data.appointmentMoment + " - " + timeframeData.value_Vie,
            doctorName: "Khám với bác sĩ " + doctorInfor.lastName + " " + doctorInfor.firstName,
            clinicName: doctorInfor.Doctor_infor.belongToSpecialty.name + " - " + doctorInfor.Doctor_specialty_medicalFacility.medicalFacilityDoctorAndSpecialty.name,
            clinicAddress: doctorInfor.Doctor_specialty_medicalFacility.medicalFacilityDoctorAndSpecialty.address,
            language: data.language,
            redirectLink,
            price: doctorInfor.Doctor_infor.priceTypeData.value_Vie + " đồng",
            isPayment: data.selectedPaymentMethod === "PM1",
        });

        return {
            errCode: 0,
            errMessage: "Booking created successfully!",
        };
    } catch (e) {
        console.error("Booking failed:", e);
        return {
            errCode: -1,
            errMessage: "Server error!",
        };
    }
};

const isBookingConfirmationExpired = (booking) => {
    if (!booking?.createdAt || !booking?.date || !booking?.timeType) {
        return true; // fail-safe
    }

    const now = moment();

    const timeStr = TIMEFRAME_MAP[booking.timeType];
    if (!timeStr) return true;

    // Thời điểm khám
    const appointmentTime = moment(`${moment(booking.date).format("YYYY-MM-DD")} ${timeStr}`, "YYYY-MM-DD HH:mm");

    // Hạn tối đa 24h kể từ lúc tạo
    const expiredByCreateTime = moment(booking.createdAt).add(24, "hours");

    // Thời điểm hết hạn thực tế = mốc đến trước
    const expiredAt = moment.min(appointmentTime, expiredByCreateTime);

    return now.isSameOrAfter(expiredAt);
};

let confirmBookingAppointmentService = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            // ===== 1. Validate input =====
            if (!data.token || !data.doctorId) {
                resolve({
                    errCode: 1,
                    errMessage: "Missing parameter(s): token or doctorId!",
                });
                return;
            }

            // ===== 2. Lấy booking =====
            let appointment = await db.Booking.findOne({
                where: {
                    doctorId: data.doctorId,
                    token: data.token,
                    statusId: "S1",
                },
                include: [
                    {
                        model: db.User,
                        as: "doctorHasAppointmentWithPatients",
                        attributes: ["id", "firstName", "lastName", "address", "phoneNumber"],
                        include: [
                            {
                                model: db.Doctor_infor,
                                attributes: {
                                    exclude: ["id", "doctorId", "provinceId", "specialtyId", "clinicId", "note", "count"],
                                },
                                include: [
                                    {
                                        model: db.Allcode,
                                        as: "priceTypeData",
                                        attributes: ["value_Eng", "value_Vie"],
                                    },
                                ],
                            },
                        ],
                    },
                ],
                raw: false,
            });

            // ===== 3. Booking không tồn tại =====
            if (!appointment) {
                resolve({
                    errCode: 2,
                    errMessage: "Appointment has been activated or does not exist!",
                });
                return;
            }

            // ===== 4. CHECK LINK EXPIRED =====
            if (isBookingConfirmationExpired(appointment)) {
                resolve({
                    errCode: 4,
                    errMessage: "Confirmation link expired!",
                });
                return;
            }

            // ===== 5. Xác nhận booking =====
            switch (appointment.paymentMethod) {
                case "PM1": {
                    const paidAmount = data.paidAmount ? data.paidAmount / 100 : 0;
                    appointment.statusId = "S2";
                    appointment.paidAmount = paidAmount;

                    let amountToBePaid = +appointment?.doctorHasAppointmentWithPatients?.Doctor_infor?.priceTypeData?.value_Vie || 0;

                    let differential = amountToBePaid - paidAmount;

                    if (differential === 0) {
                        appointment.paymentStatus = "PT3"; // paid full
                    } else if (differential > 0) {
                        appointment.paymentStatus = "PT2"; // paid partial
                    }

                    await appointment.save();
                    break;
                }

                case "PM2":
                case "PM3":
                    appointment.statusId = "S2";
                    await appointment.save();
                    break;

                default:
                    resolve({
                        errCode: 3,
                        errMessage: "Unsupported payment method!",
                    });
                    return;
            }

            // ===== 6. Done =====
            resolve({
                errCode: 0,
                errMessage: "The patient has confirmed!",
            });
        } catch (e) {
            console.error("confirmBookingAppointmentService error:", e);
            reject(e);
        }
    });
};

let confirmBookingExamPackageService = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            // ===== 1. Validate =====
            if (!data.token || !data.packageId) {
                resolve({
                    errCode: 1,
                    message: "Thiếu thông tin xác nhận gói khám.",
                });
                return;
            }

            // ===== 2. Lấy booking =====
            let booking = await db.ExamPackage_booking.findOne({
                where: {
                    examPackageId: data.packageId,
                    token: data.token,
                    statusId: "S1",
                },
                raw: false,
            });

            // ===== 3. Không tồn tại =====
            if (!booking) {
                resolve({
                    errCode: 2,
                    message: "Gói khám đã được xác nhận hoặc không tồn tại.",
                });
                return;
            }

            // ===== 4. CHECK LINK EXPIRED (DÙNG CHUNG) =====
            if (isBookingConfirmationExpired(booking)) {
                // booking.statusId = "S4"; // expired (nếu bạn có enum)
                await booking.save();

                resolve({
                    errCode: 4,
                    message: "Liên kết xác nhận gói khám đã hết hạn.",
                });
                return;
            }

            // ===== 5. Xác nhận booking =====
            booking.statusId = "S2";
            await booking.save();

            // ===== 6. Done =====
            resolve({
                errCode: 0,
                message: "Xác nhận gói khám thành công.",
            });
        } catch (e) {
            console.error("confirmBookingExamPackageService error:", e);
            reject({
                errCode: -1,
                message: "Lỗi hệ thống khi xác nhận gói khám.",
            });
        }
    });
};

let getAppointmentHistoriesByPatientEmailService = (inputPatientEmail) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!inputPatientEmail) {
                resolve({
                    errCode: 1,
                    errMessage: `Missing required parameters: patient's email!`,
                });
            } else {
                let user = await db.User.findOne({
                    where: {
                        email: inputPatientEmail,
                    },
                    attributes: {
                        exclude: ["createdAt", "updatedAt", "image"],
                    },
                });
                if (user) {
                    let data = await db.Booking.findAll({
                        where: {
                            patientId: user.id,
                            statusId: "S3",
                            paymentStatus: "PT3",
                        },
                        include: [
                            {
                                model: db.Allcode,
                                as: "appointmentTimeTypeData",
                                attributes: ["value_Vie", "value_Eng"],
                            },
                            {
                                model: db.User,
                                as: "doctorHasAppointmentWithPatients",
                                attributes: ["id", "firstName", "lastName", "address", "phoneNumber", "email"],
                            },
                        ],
                        attributes: {
                            exclude: ["createdAt", "updatedAt"],
                        },
                        raw: false,
                    });
                    if (!data) {
                        data = {};
                    }

                    resolve({
                        data: data,
                        errCode: 0,
                        errMessage: "Get appointment histories successfully!",
                    });
                } else {
                    resolve({
                        errCode: 1,
                        errMessage: "User not found!",
                    });
                }
            }
        } catch (e) {
            reject(e);
        }
    });
};

let getPatientAppointmentsOverviewStatisticsService = (patientId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!patientId) {
                return resolve({
                    errCode: 1,
                    errMessage: "Missing required parameter patientId!",
                });
            }

            // Tổng số lịch khám
            let totalAppointments = await db.Booking.count({
                where: { patientId: patientId },
            });

            // Số lịch sắp tới: status S2 (đã xác nhận)
            let upcoming = await db.Booking.count({
                where: {
                    patientId: patientId,
                    statusId: "S2",
                },
            });

            // Số lịch hoàn thành: S3
            let completed = await db.Booking.count({
                where: {
                    patientId: patientId,
                    statusId: "S3",
                },
            });

            // Số lịch hủy: S4
            let cancelled = await db.Booking.count({
                where: {
                    patientId: patientId,
                    statusId: "S4",
                },
            });

            return resolve({
                errCode: 0,
                errMessage: "OK",
                data: {
                    totalAppointments: totalAppointments,
                    upcomingAppointments: upcoming,
                    completedAppointments: completed,
                    cancelledAppointments: cancelled,
                },
            });
        } catch (e) {
            reject(e);
        }
    });
};

let getPatientAppointmentsNearestService = (patientId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!patientId) {
                return resolve({
                    errCode: 1,
                    errMessage: "Missing required parameter patientId!",
                });
            }

            const timeOrder = {
                T1: 1,
                T2: 2,
                T3: 3,
                T4: 4,
                T5: 5,
                T6: 6,
                T7: 7,
                T8: 8,
            };

            let bookings = await db.Booking.findAll({
                where: {
                    patientId: patientId,
                    statusId: "S2",
                },
                attributes: {
                    exclude: ["files"],
                },
                include: [
                    {
                        model: db.Allcode,
                        as: "appointmentTimeTypeData",
                        attributes: ["value_Vie", "value_Eng"],
                    },
                    {
                        model: db.User,
                        as: "doctorHasAppointmentWithPatients",
                        attributes: ["id", "firstName", "lastName", "address", "phoneNumber", "email"],
                        include: [
                            {
                                model: db.Doctor_specialty_medicalFacility,
                                attributes: ["specialtyId", "medicalFacilityId"], // tuỳ bạn
                                include: [
                                    {
                                        model: db.Specialty,
                                        attributes: ["id", "name"],
                                    },
                                    {
                                        model: db.ComplexMedicalFacility,
                                        as: "medicalFacilityDoctorAndSpecialty",
                                        attributes: ["id", "name", "address"],
                                    },
                                ],
                            },
                        ],
                    },
                ],
                raw: true,
                nest: true,
            });

            if (!bookings || bookings.length === 0) {
                return resolve({
                    errCode: 0,
                    errMessage: "No upcoming appointments found!",
                    data: [],
                });
            }

            let sortedBookings = bookings
                .map((item) => {
                    return {
                        ...item,
                        dateValue: new Date(item.date).getTime(),
                        timeValue: timeOrder[item.timeType] || 99,
                    };
                })
                .sort((a, b) => {
                    if (a.dateValue !== b.dateValue) {
                        return a.dateValue - b.dateValue;
                    }
                    return a.timeValue - b.timeValue;
                })
                .slice(0, 3);

            return resolve({
                errCode: 0,
                errMessage: "Get nearest appointments successfully!",
                data: sortedBookings,
            });
        } catch (e) {
            reject(e);
        }
    });
};

let getPatientAppointmentsMonthlyVisitsService = (patientId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!patientId) {
                return resolve({
                    errCode: 1,
                    errMessage: "Missing required parameter patientId!",
                });
            }

            const now = new Date();
            const year = now.getFullYear();
            const currentMonth = now.getMonth() + 1;

            const startMonth = currentMonth <= 6 ? 1 : 7;
            const endMonth = currentMonth <= 6 ? 6 : 12;

            const startDate = new Date(year, startMonth - 1, 1, 0, 0, 0);
            const endDate = new Date(year, endMonth, 0, 23, 59, 59);

            let bookings = await db.Booking.findAll({
                where: {
                    patientId,
                    date: {
                        [db.Sequelize.Op.gte]: startDate,
                        [db.Sequelize.Op.lte]: endDate,
                    },
                },
                attributes: ["id", "date"],
                raw: true,
            });

            let monthlyStats = [];

            for (let month = startMonth; month <= endMonth; month++) {
                const visits = bookings.filter((b) => {
                    const bookingMonth = new Date(b.date).getMonth() + 1;
                    return bookingMonth === month;
                }).length;

                monthlyStats.push({
                    month: `Tháng ${month}`,
                    visits,
                });
            }

            return resolve({
                errCode: 0,
                errMessage: "Get monthly visits successfully!",
                data: {
                    range: `${startMonth}-${endMonth}`,
                    monthlyStats,
                },
            });
        } catch (e) {
            reject(e);
        }
    });
};

let getPatientFrequentVisitsMedicalFacilitiesAndDoctorsService = (patientId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!patientId) {
                return resolve({
                    errCode: 1,
                    errMessage: "Missing required parameter patientId!",
                });
            }

            // 1. Lấy toàn bộ lịch khám S2 của bệnh nhân
            let bookings = await db.Booking.findAll({
                where: { patientId },
                attributes: ["doctorId", "date", "timeType"],
                raw: true,
            });

            if (!bookings || bookings.length === 0) {
                return resolve({
                    errCode: 0,
                    errMessage: "No booking data!",
                    topDoctors: [],
                    topMedicalFacilities: [],
                });
            }

            // 2. Đếm số lần gặp từng bác sĩ
            let doctorCount = {};
            let facilityCount = {};

            for (let b of bookings) {
                // count doctor
                if (!doctorCount[b.doctorId]) doctorCount[b.doctorId] = 0;
                doctorCount[b.doctorId]++;
            }

            // 3. Sắp xếp để lấy top 4 bác sĩ
            let topDoctorIds = Object.entries(doctorCount)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 4) // top 4
                .map((item) => ({
                    doctorId: item[0],
                    visits: item[1],
                }));

            // 4. Lấy detail bác sĩ + chuyên khoa + cơ sở y tế
            let topDoctors = [];

            for (let d of topDoctorIds) {
                let doctorDetail = await db.User.findOne({
                    where: { id: d.doctorId },
                    attributes: ["id", "firstName", "lastName", "address", "phoneNumber", "email"],
                    include: [
                        {
                            model: db.Doctor_specialty_medicalFacility,
                            attributes: ["specialtyId", "medicalFacilityId"],
                            include: [
                                {
                                    model: db.Specialty,
                                    attributes: ["id", "name"],
                                },
                                {
                                    model: db.ComplexMedicalFacility,
                                    as: "medicalFacilityDoctorAndSpecialty",
                                    attributes: ["id", "name", "address"],
                                },
                            ],
                        },
                    ],
                    raw: true,
                    nest: true,
                });

                if (!doctorDetail) continue;

                let medicalFacility = doctorDetail.Doctor_specialty_medicalFacility.medicalFacilityDoctorAndSpecialty;

                // Đếm số lần đến cơ sở y tế
                if (medicalFacility) {
                    if (!facilityCount[medicalFacility.id]) facilityCount[medicalFacility.id] = 0;
                    facilityCount[medicalFacility.id] += d.visits; // cộng lượt khám của bác sĩ luôn
                }

                topDoctors.push({
                    visits: d.visits,
                    doctorInfo: {
                        id: doctorDetail.id,
                        firstName: doctorDetail.firstName,
                        lastName: doctorDetail.lastName,
                        email: doctorDetail.email,
                        phoneNumber: doctorDetail.phoneNumber,
                        address: doctorDetail.address,
                    },
                    specialty: doctorDetail.Doctor_specialty_medicalFacility.Specialty,
                    medicalFacility: medicalFacility,
                });
            }

            // 5. Lấy top 4 cơ sở y tế
            let topMedicalFacilities = Object.entries(facilityCount)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 4)
                .map(([facilityId, visits]) => ({
                    medicalFacilityId: facilityId,
                    visits,
                }));

            // Lấy chi tiết cơ sở y tế
            for (let f of topMedicalFacilities) {
                let facilityDetail = await db.ComplexMedicalFacility.findOne({
                    where: { id: f.medicalFacilityId },
                    attributes: ["id", "name", "address"],
                    raw: true,
                });

                f.facilityInfo = facilityDetail;
            }

            // DONE
            return resolve({
                errCode: 0,
                errMessage: "Get frequently visited doctors & medical facilities successfully!",
                topDoctors,
                topMedicalFacilities,
            });
        } catch (e) {
            console.log("Error getPatientFrequentVisitsMedicalFacilitiesAndDoctorsService:", e);
            reject(e);
        }
    });
};

let getPatientExamPackageTimeService = (patientId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!patientId) {
                resolve({
                    errCode: 1,
                    errMessage: `Missing parameter(s): patientId!`,
                });
            }

            let bookingData = await db.ExamPackage_booking.findAll({
                where: {
                    patientId: patientId,
                },
                include: [
                    {
                        model: db.ExamPackage_specialty_medicalFacility,
                        as: "examPackage",
                        attributes: {
                            exclude: ["htmlDescription", "markdownDescription", "htmlCategory", "markdownCategory"],
                        },
                        include: [
                            {
                                model: db.ComplexMedicalFacility,
                                as: "medicalFacilityPackage",
                                attributes: {
                                    exclude: ["htmlDescription", "markdownDescription", "htmlEquipment", "markdownEquipment", "image"],
                                },
                            },
                            {
                                model: db.Specialty,
                                as: "examPackageHaveSpecialty",
                                attributes: {
                                    exclude: ["specialtyImage"],
                                },
                            },
                        ],
                    },
                    {
                        model: db.ExamPackage_result,
                        as: "examPackageResult",
                    },
                    {
                        model: db.Allcode,
                        as: "examPackageTimeTypeData",
                    },
                ],
            });

            if (bookingData) {
                resolve({
                    errCode: 0,
                    errMessage: `Get patient's exampackage time data successfully!`,
                    bookingData: bookingData,
                });
            }
        } catch (e) {
            reject(e);
        }
    });
};

module.exports = {
    handlePatientBookingAppointmentService: handlePatientBookingAppointmentService,
    confirmBookingAppointmentService: confirmBookingAppointmentService,
    confirmBookingExamPackageService: confirmBookingExamPackageService,
    getAppointmentHistoriesByPatientEmailService: getAppointmentHistoriesByPatientEmailService,
    getPatientAppointmentsOverviewStatisticsService: getPatientAppointmentsOverviewStatisticsService,
    getPatientAppointmentsNearestService: getPatientAppointmentsNearestService,
    getPatientAppointmentsMonthlyVisitsService: getPatientAppointmentsMonthlyVisitsService,
    getPatientFrequentVisitsMedicalFacilitiesAndDoctorsService: getPatientFrequentVisitsMedicalFacilitiesAndDoctorsService,
    getPatientExamPackageTimeService: getPatientExamPackageTimeService,
};
