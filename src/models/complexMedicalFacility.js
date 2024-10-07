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