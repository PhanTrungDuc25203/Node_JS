"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class DoctorPackageRate extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            DoctorPackageRate.belongsTo(models.User, { foreignKey: "userId", targetKey: "id", as: "patientData" });
            DoctorPackageRate.belongsTo(models.User, { foreignKey: "doctorId", targetKey: "id", as: "doctorData" });
            DoctorPackageRate.belongsTo(models.Booking, { foreignKey: "appointmentId", targetKey: "id", as: "appointmentData" });
            DoctorPackageRate.belongsTo(models.ExamPackage_booking, { foreignKey: "paidPackageId", targetKey: "id", as: "paidPackageData" });
            DoctorPackageRate.belongsTo(models.ExamPackage_specialty_medicalFacility, { foreignKey: "packageId", targetKey: "id", as: "packageRatings" });
        }
    }
    DoctorPackageRate.init(
        {
            userId: DataTypes.INTEGER,
            userEmail: DataTypes.STRING,
            doctorId: DataTypes.INTEGER,
            doctorEmail: DataTypes.STRING,
            packageId: DataTypes.INTEGER,
            packageName: DataTypes.STRING,
            appointmentId: DataTypes.INTEGER,
            paidPackageId: DataTypes.INTEGER,
            rating: DataTypes.INTEGER,
            content: DataTypes.TEXT("long"),
            images: DataTypes.TEXT("long"),
        },
        {
            sequelize,
            modelName: "DoctorPackageRate",
        }
    );
    return DoctorPackageRate;
};
