import { Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import "process";

export const index = (req: Request, res: Response) => {
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
    // from now on we'll identify the user by the id and the id is the only personalized value that goes into our token
    const payload = {id: user.id};
    const token = jwt.sign(payload, process.env.JWT_SECRET);
    res.json({message: "ok", token});
  } else {
    res.status(401).json({message: "Unauthorised."});
  }
};
