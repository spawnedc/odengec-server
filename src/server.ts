import * as express from "express";
import * as HomeController from "./controllers/home";

const app = express();
const port = 3000;

app.listen(3000);

app.get("/", HomeController.index);

//tslint:disable
console.warn(`Server ready on port ${port}`);
