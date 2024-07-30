'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Doctor_clinic_specialty extends Model {
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
  Doctor_clinic_specialty.init({
    doctorId: DataTypes.INTEGER,
    clinicId: DataTypes.INTEGER,
    specialty: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'Doctor_clinic_specialty',
  });
  return Doctor_clinic_specialty;
};