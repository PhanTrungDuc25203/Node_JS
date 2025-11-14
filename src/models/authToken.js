"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class AuthToken extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            //nơi định nghĩa các mối quan hệ, 1-n,1-1,n-1,n-n?...
            AuthToken.belongsTo(models.User, { foreignKey: "userId" });
        }
    }
    AuthToken.init(
        {
            userId: DataTypes.INTEGER,
            refreshToken: DataTypes.STRING,
            expiresAt: DataTypes.DATE,
        },
        {
            sequelize,
            modelName: "AuthToken",
        }
    );
    return AuthToken;
};
