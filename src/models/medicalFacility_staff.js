"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class MedicalFacility_staff extends Model {
        static associate(models) {
            // define association here
        }
    }

    MedicalFacility_staff.init(
        {
            staffId: DataTypes.INTEGER,
            medicalFacilityId: DataTypes.INTEGER,
            role: DataTypes.STRING,
        },
        {
            sequelize,
            modelName: "MedicalFacility_staff",
        }
    );

    return MedicalFacility_staff;
};
