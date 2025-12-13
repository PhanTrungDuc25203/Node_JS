"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class ExamPackage_result_template extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            //nơi định nghĩa các mối quan hệ, 1-n,1-1,n-1,n-n?...
            ExamPackage_result_template.belongsTo(models.ExamPackage_specialty_medicalFacility, {
                as: "examPackage",
                foreignKey: "examPackageId",
            });
        }
    }
    ExamPackage_result_template.init(
        {
            examPackageId: DataTypes.INTEGER,
            version: DataTypes.INTEGER,
            template: DataTypes.TEXT("long"),
        },
        {
            sequelize,
            modelName: "ExamPackage_result_template",
        }
    );
    return ExamPackage_result_template;
};
