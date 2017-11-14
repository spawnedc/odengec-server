import { Request, Response } from "express";
import { Container, Mapper } from "js-data";

export const index = async (req: Request, res: Response) => {
  const store: Container = req.app.get("store");
  const userService: Mapper = store.getMapper("user");
  const users = await userService.findAll({});
  const userList: any[] = users.map((user: any) => ({username: user.username, created: user.created}));
  res.json(userList);
};
