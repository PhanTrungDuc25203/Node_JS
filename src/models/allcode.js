'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Allcode extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            //nơi định nghĩa các mối quan hệ, 1-n,1-1,n-1,n-n?...
            Allcode.hasMany(models.User, { foreignKey: 'positionId', as: 'positionData' })
            Allcode.hasMany(models.User, { foreignKey: 'roleId', as: 'roleData' })
            Allcode.hasMany(models.User, { foreignKey: 'gender', as: 'genderData' })
            Allcode.hasMany(models.Schedule, { foreignKey: 'timeType', as: 'timeTypeData' })

            Allcode.hasMany(models.Doctor_infor, { foreignKey: 'priceId', as: 'priceTypeData' })
            Allcode.hasMany(models.Doctor_infor, { foreignKey: 'provinceId', as: 'provinceTypeData' })
            Allcode.hasMany(models.Doctor_infor, { foreignKey: 'paymentId', as: 'paymentTypeData' })
            Allcode.hasMany(models.ComplexMedicalFacility, { foreignKey: 'provinceId', as: 'provinceTypeDataForFacility' })
            Allcode.hasMany(models.Booking, { foreignKey: 'timeType', as: 'appointmentTimeTypeData' })

            Allcode.hasMany(models.History, { foreignKey: 'appointmentTimeFrame', as: 'appointmentTimeFrameData' })
        }
    }
    Allcode.init({
        keyMap: DataTypes.STRING,
        type: DataTypes.STRING,
        value_Eng: DataTypes.STRING,
        value_Vie: DataTypes.STRING,
    }, {
        sequelize,
        modelName: 'Allcode',
    });
    return Allcode;
};