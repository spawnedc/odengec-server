import { config } from "./config";
import * as HomeController from "./controllers/home";
import * as UsersController from "./controllers/users";
import { IMysqlConfig, OdengecApi } from "./odengecApi";
import { RequestMethods } from "./requestMethods";

const secretKey = process.env[config.jwt.secretEnvKey];
const mysqlConfig: IMysqlConfig = {
  database: "odengec",
  host: process.env.MYSQL_HOST,
  password: process.env.MYSQL_PASSWORD,
  port: process.env.MYSQL_PORT,
  user: "odengec",
};
const api = new OdengecApi(config.port, config.routes.apiRoot, secretKey, mysqlConfig);

api.addRoute("/", RequestMethods.GET, HomeController.index);
api.addRoute("/users", RequestMethods.GET, UsersController.index);

api.start();
