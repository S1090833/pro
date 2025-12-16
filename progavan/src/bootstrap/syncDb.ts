// src/bootstrap/syncDb.ts
import SequelizeSingleton from "../config/db";


export async function syncDb() {
  const sequelize = SequelizeSingleton.getInstance();
  // sincronizza tutte le tabelle (alter può modificare tabelle esistenti)
  await sequelize.sync({ alter: true });
}
