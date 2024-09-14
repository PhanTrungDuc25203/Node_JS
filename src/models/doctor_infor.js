'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Doctor_infor extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      //nơi định nghĩa các mối quan hệ, 1-n,1-1,n-1,n-n?...
      Doctor_infor.belongsTo(models.User, { foreignKey: 'doctorId' });

      Doctor_infor.belongsTo(models.Allcode, { foreignKey: 'priceId', targetKey: 'keyMap', as: 'priceTypeData' })
      Doctor_infor.belongsTo(models.Allcode, { foreignKey: 'provinceId', targetKey: 'keyMap', as: 'provinceTypeData' })
      Doctor_infor.belongsTo(models.Allcode, { foreignKey: 'paymentId', targetKey: 'keyMap', as: 'paymentTypeData' })

      Doctor_infor.belongsTo(models.Specialty, { foreignKey: 'specialtyId', targetKey: 'id', as: 'belongToSpecialty' })
    }
  }
  Doctor_infor.init({
    doctorId: DataTypes.INTEGER,
    priceId: DataTypes.STRING,
    provinceId: DataTypes.STRING,
    specialtyId: DataTypes.INTEGER,
    clinicId: DataTypes.INTEGER,
    paymentId: DataTypes.STRING,
    clinicAddress: DataTypes.STRING,
    clinicName: DataTypes.STRING,
    note: DataTypes.STRING,
    count: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'Doctor_infor',
  });
  return Doctor_infor;
};