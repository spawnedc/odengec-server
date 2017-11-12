import { config } from "./config";
import * as HomeController from "./controllers/home";
import { OdengecApi } from "./odengecApi";
import { RequestMethods } from "./requestMethods";

const api = new OdengecApi(config.port, config.routes.apiRoot, process.env[config.jwt.secretEnvKey]);

api.addRoute("/", RequestMethods.GET, HomeController.index);

api.start();
