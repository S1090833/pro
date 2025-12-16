import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";


export function auth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  console.log("Authorization header:", header); 

  if (!header) return res.status(401).json({ error: "No token" });

  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    (req as any).user = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}
