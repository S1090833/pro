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
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  },

  async delete(req: Request, res: Response) {
    const id = Number(req.params.id);

    const user = await userDao.getById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // 🔒 BLOCCO eliminazione admin
    if (user.role === "DEFAULT_ADMIN_ROLE") {
      return res.status(403).json({
        error: "Il DEFAULT_ADMIN_ROLE non può essere eliminato"
      });
    }

    const ok = await userDao.deleteUser(id);
    res.json({ success: ok });
  }
};
