'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class ExamPackage_specialty_medicalFacility extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            //nơi định nghĩa các mối quan hệ, 1-n,1-1,n-1,n-n?...
            ExamPackage_specialty_medicalFacility.belongsTo(models.ComplexMedicalFacility, { foreignKey: 'medicalFacilityId', targetKey: 'id', as: 'medicalFacilityPackage' })
            ExamPackage_specialty_medicalFacility.belongsTo(models.Allcode, { foreignKey: 'priceId', targetKey: 'keyMap', as: 'priceDataForPackage' })
        }
    }
    ExamPackage_specialty_medicalFacility.init({
        name: DataTypes.STRING,
        specialtyId: DataTypes.INTEGER,
        medicalFacilityId: DataTypes.INTEGER,
        htmlDescription: DataTypes.TEXT('long'),
        markdownDescription: DataTypes.TEXT('long'),
        htmlCategory: DataTypes.TEXT('long'),
        markdownCategory: DataTypes.TEXT('long'),
        priceId: DataTypes.STRING,
        image: DataTypes.TEXT('long'),
    }, {
        sequelize,
        modelName: 'ExamPackage_specialty_medicalFacility',
    });
    return ExamPackage_specialty_medicalFacility;
};