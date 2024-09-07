import { resolveInclude } from "ejs";
import db from "../models/index";
import bcrypt from 'bcryptjs';
require('dotenv').config();
import _ from 'lodash';
import moment from "moment";
import { where } from "sequelize";
import sendEmailService from "./sendEmailService";

let patientInforWhenBookingTimeService = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.email || !data.doctorId || !data.timeType || !data.date ||
                !data.fullname || !data.appointmentMoment || !data.phoneNumber
            ) {
                resolve({
                    errCode: 1,
                    errMessage: `Missing parameter: patient's email`,
                })
            } else {

                await sendEmailService.sendAEmail({
                    receiverEmail: data.email,
                    patientName: data.fullname,
                    time: data.appointmentMoment,
                    doctorName: 'Quý',
                    clinicName: 'Phòng khám sản phụ khoa',
                    redirectLink: 'https://www.youtube.com/@pisceanduc2200',
                });

                //upsert data
                let patient = await db.User.findOrCreate({
                    where: { email: data.email },
                    defaults: {
                        email: data.email,
                        lastName: data.fullname,
                        phoneNumber: data.phoneNumber,
                        address: data.address,
                        gender: data.selectedGender,
                        roleId: 'R3',
                    }
                });

                //create a booking records
                if (patient && patient[0]) {
                    await db.Booking.findOrCreate({
                        where: { patientId: patient[0].id },
                        defaults: {
                            statusId: 'S1', //hardcode
                            doctorId: data.doctorId,
                            patientId: patient[0].id,
                            date: data.date,
                            timeType: data.timeType,
                            patientPhoneNumber: data.phoneNumber,
                            patientBirthday: data.birthday,
                            patientAddress: data.address,
                            patientGender: data.selectedGender,
                        }
                    })
                }

                resolve({
                    errCode: 0,
                    errMessage: `Save patient's information successfully!`,
                    // data: patient,
                });
            }
        } catch (e) {
            reject(e);
        }
    })
}

module.exports = {
    patientInforWhenBookingTimeService: patientInforWhenBookingTimeService,
}