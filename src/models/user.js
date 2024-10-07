'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            //nơi định nghĩa các mối quan hệ, 1-n,1-1,n-1,n-n?...
            User.belongsTo(models.Allcode, { foreignKey: 'positionId', targetKey: 'keyMap', as: 'positionData' })
            User.belongsTo(models.Allcode, { foreignKey: 'roleId', targetKey: 'keyMap', as: 'roleData' })
            User.belongsTo(models.Allcode, { foreignKey: 'gender', targetKey: 'keyMap', as: 'genderData' })
            User.hasOne(models.ArticleMarkdown, { foreignKey: 'doctorId' })
            User.hasMany(models.Booking, { foreignKey: 'doctorId', as: 'doctorHasAppointmentWithPatients' })
            User.hasMany(models.Booking, { foreignKey: 'patientId', as: 'patientHasAppointmentWithDoctors' })
            User.hasOne(models.Doctor_specialty_medicalFacility, { foreignKey: 'doctorId' })
            User.hasOne(models.Doctor_infor, { foreignKey: 'doctorId' })
        }
    }
    User.init({
        email: DataTypes.STRING,
        password: DataTypes.STRING,
        firstName: DataTypes.STRING,
        lastName: DataTypes.STRING,
        address: DataTypes.STRING,
        phoneNumber: DataTypes.STRING,
        gender: DataTypes.STRING,
        image: DataTypes.STRING,
        roleId: DataTypes.STRING,
        positionId: DataTypes.STRING,
    }, {
        sequelize,
        modelName: 'User',
    });
    return User;
};