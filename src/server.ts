import * as bodyParser from "body-parser";
import * as express from "express";
import { Application, Express, Request, Router } from "express";
import * as jwt from "jsonwebtoken";
import * as passport from "passport";
import { ExtractJwt, Strategy, StrategyOptions, VerifiedCallback, VerifyCallback } from "passport-jwt";
import "process";
import * as HomeController from "./controllers/home";
import * as LoginController from "./controllers/login";

const jwtOptions: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

const verifyCallback: VerifyCallback = (payload: any, done: VerifiedCallback) => {
  // usually this would be a database call:
  const user = { id: 1, name: "Can" };
  if (user) {
    done(null, user);
  } else {
    done(null, false);
  }
};

const strategy: Strategy = new Strategy(jwtOptions, verifyCallback);
const apiRoutes: Router = express.Router();
const app: Express = express();
const port = 3000;

passport.use(strategy);

app.use(passport.initialize());
app.use(bodyParser.json());

apiRoutes.post("/login", LoginController.index);

apiRoutes.use(passport.authenticate("jwt", { session: false }));
apiRoutes.get("/", HomeController.index);

app.use("/api", apiRoutes);
app.listen(port);
