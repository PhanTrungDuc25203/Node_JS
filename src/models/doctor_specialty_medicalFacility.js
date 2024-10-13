'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Doctor_specialty_medicalFacility extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            Doctor_specialty_medicalFacility.belongsTo(models.User, { foreignKey: 'doctorId' });
            Doctor_specialty_medicalFacility.belongsTo(models.Specialty, { foreignKey: 'specialtyId' });
            Doctor_specialty_medicalFacility.belongsTo(models.ComplexMedicalFacility, { foreignKey: 'medicalFacilityId', targetKey: 'id', as: 'medicalFacilityDoctorAndSpecialty' });
        }
    }
    Doctor_specialty_medicalFacility.init({
        doctorId: DataTypes.INTEGER,
        specialtyId: DataTypes.INTEGER,
        medicalFacilityId: DataTypes.INTEGER,
    }, {
        sequelize,
        modelName: 'Doctor_specialty_medicalFacility',
    });
    return Doctor_specialty_medicalFacility;
};