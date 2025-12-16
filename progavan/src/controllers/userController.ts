import { Request, Response } from "express";
import { userService } from "../services/userService";
import { userDao } from "../daos/userDao";

export const userController = {
  async register(req: any, res: Response) {
    try {
      const { email, password, role, ethAddress } = req.body;

      if (!ethAddress) {
        return res.status(400).json({ error: "ethAddress mancante" });
      }

      const user = await userService.register(email, password, role, ethAddress);

      res.status(201).json(user);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const result = await userService.login(email, password);

      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },

  async list(req: Request, res: Response) {
    const users = await userDao.listUsers();
    res.json(users);
  },

  async get(req: Request, res: Response) {
    const user = await userDao.getById(Number(req.params.id));
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  },

  async update(req: Request, res: Response) {
    const updated = await userDao.updateUser(Number(req.params.id), req.body.role);
    res.json(updated);
  },

  async delete(req: Request, res: Response) {
    const ok = await userDao.deleteUser(Number(req.params.id));
    res.json({ success: ok });
  }
};
