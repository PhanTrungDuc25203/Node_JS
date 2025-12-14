"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class ExamPackage_result extends Model {
        static associate(models) {
            // define association here
        }
    }
    ExamPackage_result.init(
        {
            bookingId: DataTypes.INTEGER,
            template: DataTypes.JSON,
            staffId: DataTypes.INTEGER,
            result: DataTypes.JSON,
            status: DataTypes.STRING,
        },
        {
            sequelize,
            modelName: "ExamPackage_result",
        }
    );
    return ExamPackage_result;
};
