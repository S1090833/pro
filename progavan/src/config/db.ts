import { Sequelize } from "sequelize";

class SequelizeSingleton {
  private static instance: Sequelize;

  private constructor() {}

  public static getInstance(): Sequelize {
    if (!SequelizeSingleton.instance) {
      SequelizeSingleton.instance = new Sequelize(
        process.env.POSTGRES_DB!,
        process.env.POSTGRES_USER!,
        process.env.POSTGRES_PASSWORD!,
        {
          host: process.env.DB_HOST || "db",
          port: Number(process.env.POSTGRES_PORT) || 5432,
          dialect: "postgres",
          logging: false,
        }
      );
    }
    return SequelizeSingleton.instance;
  }
}

export default SequelizeSingleton;