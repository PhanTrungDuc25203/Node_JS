'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Booking extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            //nơi định nghĩa các mối quan hệ, 1-n,1-1,n-1,n-n?...
            Booking.belongsTo(models.User, { foreignKey: 'doctorId', targetKey: 'id', as: 'doctorHasAppointmentWithPatients' })
            Booking.belongsTo(models.User, { foreignKey: 'patientId', targetKey: 'id', as: 'patientHasAppointmentWithDoctors' })
            Booking.belongsTo(models.Allcode, { foreignKey: 'timeType', targetKey: 'keyMap', as: 'appointmentTimeTypeData' })
        }
    }
    Booking.init({
        statusId: DataTypes.STRING,
        doctorId: DataTypes.INTEGER,
        patientId: DataTypes.INTEGER,
        date: DataTypes.DATE,
        //
        patientPhoneNumber: DataTypes.STRING,
        patientBirthday: DataTypes.DATE,
        patientAddress: DataTypes.STRING,
        patientGender: DataTypes.STRING,
        token: DataTypes.STRING,

        timeType: DataTypes.STRING,
    }, {
        sequelize,
        modelName: 'Booking',
    });
    return Booking;
};