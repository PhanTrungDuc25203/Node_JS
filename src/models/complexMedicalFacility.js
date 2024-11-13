'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class ComplexMedicalFacility extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            ComplexMedicalFacility.hasMany(models.MedicalFacilitySpecialtyArea, { foreignKey: 'medicalFacilityId', as: 'medicalFacilitySpecialtyData' })
            ComplexMedicalFacility.hasMany(models.Doctor_specialty_medicalFacility, { foreignKey: 'medicalFacilityId', as: 'medicalFacilityDoctorAndSpecialty' })
            ComplexMedicalFacility.belongsTo(models.Allcode, { foreignKey: 'provinceId', targetKey: 'keyMap', as: 'provinceTypeDataForFacility' })
            ComplexMedicalFacility.hasMany(models.ExamPackage_specialty_medicalFacility, { foreignKey: 'medicalFacilityId', as: 'medicalFacilityPackage' })
        }
    }
    ComplexMedicalFacility.init({
        name: DataTypes.STRING,
        provinceId: DataTypes.STRING,
        address: DataTypes.STRING,
        htmlDescription: DataTypes.TEXT('long'),
        markdownDescription: DataTypes.TEXT('long'),
        htmlEquipment: DataTypes.TEXT('long'),
        markdownEquipment: DataTypes.TEXT('long'),
        image: DataTypes.TEXT('long'),
    }, {
        sequelize,
        modelName: 'ComplexMedicalFacility',
    });
    return ComplexMedicalFacility;
};