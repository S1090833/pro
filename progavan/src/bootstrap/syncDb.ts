// src/bootstrap/syncDb.ts
import SequelizeSingleton from "../config/db";
import { User } from "../models/user";
import { Lot } from "../models/Lot";
import { LotHistory } from "../models/lotHistory";

export async function syncDb() {
  const sequelize = SequelizeSingleton.getInstance();
  // sincronizza tutte le tabelle (alter può modificare tabelle esistenti)
  await sequelize.sync({ alter: true });
}
