import app from "./app";
import { syncDb } from "./bootstrap/syncDb";
import { syncAdminUser } from "./bootstrap/adminBootstrap";
import waitPort from "wait-port";

const PORT = process.env.PORT || 3000;
const DB_HOST = process.env.DB_HOST || "db";
const DB_PORT = process.env.POSTGRES_PORT ? parseInt(process.env.POSTGRES_PORT, 10) : 5432;

async function startServer() {
  console.log(`Waiting for DB at ${DB_HOST}:${DB_PORT}...`);

  const open = await waitPort({ host: DB_HOST, port: DB_PORT, timeout: 60000 });

  if (!open) {
    console.error(" Database non raggiungibile dopo timeout");
    process.exit(1);
  }

  console.log("Database raggiunto, sincronizzo modelli...");

  try {
    await syncDb();
    console.log(" Modelli sincronizzati");

    await syncAdminUser();
    console.log("Admin pronto");

  } catch (err) {
    console.error("Errore durante syncDb o syncAdminUser:", err);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(` Server running on port ${PORT}`);
  });
}

startServer();
