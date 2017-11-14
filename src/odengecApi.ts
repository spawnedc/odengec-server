import * as bodyParser from "body-parser";
import * as express from "express";
import { Application, Express, Request, RequestHandler, Response, Router } from "express";
import { Container, Mapper } from "js-data";
import { SqlAdapter } from "js-data-sql";
import * as jwt from "jsonwebtoken";
import * as passport from "passport";
import { ExtractJwt, Strategy, StrategyOptions, VerifiedCallback, VerifyCallback } from "passport-jwt";

import { RequestMethods } from "./requestMethods";
import * as schemas from "./schemas";

interface IMysqlConfig {
  database: string;
  host: string;
  password: string;
  port: string;
  user: string;
}

class OdengecApi {
  private readonly app: Express;
  private readonly strategy: Strategy;
  private readonly jwtOptions: StrategyOptions;
  private readonly router: Router;
  private readonly port: number;
  private readonly apiRoot: string;
  private readonly secretKey: string;
  private readonly store: Container;
  private readonly mysqlConfig: IMysqlConfig;

  constructor(port: number, apiRoot: string, secretKey: string, mysqlConfig: IMysqlConfig) {
    this.port = port;
    this.apiRoot = apiRoot;
    this.secretKey = secretKey;
    this.mysqlConfig = mysqlConfig;

    this.jwtOptions = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: this.secretKey,
    };

    this.strategy = new Strategy(this.jwtOptions, this.verifyCallback);
    passport.use(this.strategy);

    this.router = express.Router();
    this.app = express();

    this.app.use(passport.initialize());
    this.app.use(bodyParser.json());

    this.store = this.setupModels();
    this.app.set("store", this.store);
    this.addRoute("/login", RequestMethods.POST, this.loginController.bind(this));

    // We don"t want to use authentication on the login route but the rest.
    this.router.use(passport.authenticate("jwt", { session: false }));
  }

  public start(): void {
    this.app.use(this.apiRoot, this.router);
    this.app.listen(this.port);
  }

  public addRoute(path: string, method: RequestMethods, ...handlers: RequestHandler[]): void {
    this.router[method].call(this.router, path, handlers);
  }

  private setupModels(): Container {
    const adapter = new SqlAdapter({
      knexOpts: {
        client: "mysql",
        connection: this.mysqlConfig,
      },
    });
    const store = new Container();
    // Adapters registered with the Container are shared
    // by all Mappers in the Container.
    store.registerAdapter("sql", adapter, { default: true });

    store.defineMapper("user", {
      schema: schemas.user,
      table: "users",
    });

    return store;
  }

  private verifyCallback: VerifyCallback = (payload: any, next: VerifiedCallback) => {
    // usually this would be a database call:
    const user = { id: 1, name: "Can" };
    if (user) {
      next(null, user);
    } else {
      next(null, false);
    }
  }

  private async loginController(req: Request, res: Response): Promise<any> {
    let username;
    let password;

    if (req.body.username && req.body.password) {
      username = req.body.username;
      password = req.body.password;
    }
    // usually this would be a database call:
    const userService: Mapper = this.store.getMapper("user");
    const user = await userService.findAll({username, password});
    if (!user) {
      res.status(401).json({message: "Unauthorised."});
    }

    const payload = {id: user.id};
    const token = jwt.sign(payload, this.secretKey);
    res.json({message: "ok", token});
  }
}

export { IMysqlConfig, OdengecApi };
