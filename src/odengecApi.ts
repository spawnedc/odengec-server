import * as bodyParser from "body-parser";
import * as express from "express";
import { Application, Express, Request, RequestHandler, Response, Router } from "express";
import * as jwt from "jsonwebtoken";
import * as passport from "passport";
import { ExtractJwt, Strategy, StrategyOptions, VerifiedCallback, VerifyCallback } from "passport-jwt";
import { RequestMethods } from "./requestMethods";

class OdengecApi {
  private readonly app: Express;
  private readonly strategy: Strategy;
  private readonly jwtOptions: StrategyOptions;
  private readonly router: Router;
  private readonly port: number;
  private readonly apiRoot: string;
  private readonly secretKey: string;

  constructor(port: number, apiRoot: string, secretKey: string) {
    this.port = port;
    this.apiRoot = apiRoot;
    this.secretKey = secretKey;

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

    this.addRoute("/login", RequestMethods.POST, this.loginController.bind(this));

    // We don't want to use authentication on the login route but the rest.
    this.router.use(passport.authenticate("jwt", { session: false }));
  }

  public start(): void {
    this.app.use(this.apiRoot, this.router);
    this.app.listen(this.port);
  }

  public addRoute(path: string, method: RequestMethods, ...handlers: RequestHandler[]): void {
    this.router[method].call(this.router, path, handlers);
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

  private loginController(req: Request, res: Response): void {
    let name;
    let password;

    if (req.body.name && req.body.password) {
      name = req.body.name;
      password = req.body.password;
    }
    // usually this would be a database call:
    const user = { id: 1, name: "Can", password: "1234" };
    if (!user) {
      res.status(401).json({message: "Unauthorised."});
    }

    if (user.password === req.body.password) {
      const payload = {id: user.id};
      const token = jwt.sign(payload, this.secretKey);
      res.json({message: "ok", token});
    } else {
      res.status(401).json({message: "Unauthorised."});
    }
  }
}

export { OdengecApi };
