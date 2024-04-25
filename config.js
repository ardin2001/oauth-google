import { Sequelize } from "sequelize";
import 'dotenv/config'
const sequelizeConfig = new Sequelize(process.env.DB_NAME, process.env.DB_USERNAME, process.env.PASSWORD, {
  host: process.env.DB_HOST,
  dialect: "mysql",
});

export default sequelizeConfig;
