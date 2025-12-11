"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class ExamPackage_booking extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            //nơi định nghĩa các mối quan hệ, 1-n,1-1,n-1,n-n?...
        }
    }
    ExamPackage_booking.init(
        {
            statusId: DataTypes.STRING,
            examPackageId: DataTypes.INTEGER,
            patientId: DataTypes.INTEGER,
            date: DataTypes.DATE,
            timeType: DataTypes.STRING,
            //
            patientPhoneNumber: DataTypes.STRING,
            patientBirthday: DataTypes.DATE,
            patientAddress: DataTypes.STRING,
            patientGender: DataTypes.STRING,
            token: DataTypes.STRING,
            paymentMethod: DataTypes.STRING,
            paymentStatus: DataTypes.STRING,
            paidAmount: DataTypes.INTEGER,
        },
        {
            sequelize,
            modelName: "ExamPackage_booking",
        }
    );
    return ExamPackage_booking;
};
