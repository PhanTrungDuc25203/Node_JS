'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class History extends Model {
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
    History.init({
        appointmentId: DataTypes.INTEGER,
        patientEmail: DataTypes.STRING,
        doctorEmail: DataTypes.STRING,
        appointmentDate: DataTypes.DATE,
        appointmentTimeFrame: DataTypes.STRING,
        description: DataTypes.TEXT,
        files: DataTypes.TEXT,
    }, {
        sequelize,
        modelName: 'History',
    });
    return History;
};