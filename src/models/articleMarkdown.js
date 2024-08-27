'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class ArticleMarkdown extends Model {
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
    ArticleMarkdown.init({
        htmlContent: DataTypes.TEXT('long'),
        markdownContent: DataTypes.TEXT('long'),
        description: DataTypes.TEXT('long'),

        doctorId: DataTypes.INTEGER,
        specialtyId: DataTypes.INTEGER,
        clinicId: DataTypes.INTEGER,
    }, {
        sequelize,
        modelName: 'ArticleMarkdown',
    });
    return ArticleMarkdown;
};