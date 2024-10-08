'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Clinic extends Model {
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
  Clinic.init({
    name: DataTypes.STRING,
    address: DataTypes.STRING,
    description: DataTypes.TEXT,
    clinicImage: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Clinic',
  });
  return Clinic;
};