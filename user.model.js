import sequelizeConfig from "./config.js";
import { DataTypes } from "sequelize";

const User = sequelizeConfig.define("user", {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  profile: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  verified_email: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
});

sequelizeConfig
  .sync()
  .then(() => {
    console.log("Book table created successfully!");
  })
  .catch((error) => {
    console.error("Unable to create table : ", error);
  });

export default User;
