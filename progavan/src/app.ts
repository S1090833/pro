import express from "express";
import { auth } from "./middleware/auth";
import { requireRole } from "./middleware/requireRole";
import { userController } from "./controllers/userController";
import { lotController } from "./controllers/lotController";


const app = express();
app.use(express.json());

app.post("/auth/login", userController.login);

app.post(
  "/users",
  auth,
  requireRole("DEFAULT_ADMIN_ROLE"),
  userController.register
);

app.post("/lots", auth, requireRole("FISHER_ROLE"), lotController.create);


app.post("/lots/:tokenId/advance", auth, lotController.advance);

// list & get

app.get("/lots/:tokenId", auth, lotController.get);

app.get("/lots/:tokenId/history", auth, lotController.getHistory);

app.get("/users", auth, requireRole("DEFAULT_ADMIN_ROLE"), userController.list);
app.get("/users/:id", auth, requireRole("DEFAULT_ADMIN_ROLE"), userController.get);
app.delete("/users/:id", auth, requireRole("DEFAULT_ADMIN_ROLE"), userController.delete);

export default app;
