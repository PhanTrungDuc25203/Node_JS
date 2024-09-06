import { resolveInclude } from "ejs";
import db from "../models/index";
import bcrypt from 'bcryptjs';
require('dotenv').config();
import _ from 'lodash';
import moment from "moment";
import { where } from "sequelize";

let patientInforWhenBookingTimeService = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.email || !data.doctorId || !data.timeType || !data.date) {
                resolve({
                    errCode: 1,
                    errMessage: `Missing parameter: patient's email`,
                })
            } else {
                //upsert data
                let patient = await db.User.findOrCreate({
                    where: { email: data.email },
                    defaults: {
                        email: data.email,
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