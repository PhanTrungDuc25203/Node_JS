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
            History.belongsTo(models.Allcode, { foreignKey: 'appointmentTimeFrame', targetKey: 'keyMap', as: 'appointmentTimeFrameData' })
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