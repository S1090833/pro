import express from "express";
import { auth } from "./middleware/auth";
import { requireRole } from "./middleware/requireRole";
import { userController } from "./controllers/userController";
import { lotController } from "./controllers/lotController";


const app = express();
app.use(express.json());

app.post("/auth/login", userController.login);
app.post("/register", userController.register);

app.post(
  "/users",
  auth,
  requireRole("DEFAULT_ADMIN_ROLE"),
  userController.register
);

app.post("/lots", auth, requireRole("FISHER_ROLE"), lotController.create);

// advance state (actor must have the role as required on-chain; middleware can verify on-chain role)
app.post("/lots/:tokenId/advance", auth, lotController.advance);

// list & get

app.get("/lots/:tokenId", auth, lotController.get);

app.get("/lots/:tokenId/history", auth, lotController.getHistory);

app.get("/users", auth, userController.list);
app.get("/users/:id", auth, userController.get);
app.put("/users/:id", auth, userController.update);
app.delete("/users/:id", auth, userController.delete);

export default app;
