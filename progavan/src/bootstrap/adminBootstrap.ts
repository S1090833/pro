import bcrypt from "bcrypt";
import { User } from "../models/user";
import { contract, web3 } from "../blockchain/web3";

export async function syncAdminUser() {
  const accounts = await web3.eth.getAccounts();
  const adminAddress = accounts[0]; // di solito è admin

  if (!adminAddress) {
    throw new Error("ADMIN_ADDRESS mancante");
  }

  // 1. Verifica se è davvero admin on-chain
  const role = "0x0000000000000000000000000000000000000000000000000000000000000000";

  const isAdmin = await contract.methods.hasRolePublic(role, adminAddress).call();

  if (!isAdmin) {
    throw new Error("Questo address non è admin on-chain:" + isAdmin);
  }

  // 2. Se non esiste nel DB → crealo
  const existing = await User.findOne({ where: { eth_address: adminAddress } });

  if (existing) {
    console.log("✅ Admin già presente nel DB");
    return;
  }

  const plainPassword = "admin";
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

  // 3. Inserisci nel DB
  await User.create({
    email: "admin@system.local",
    password_hash: hashedPassword,
    role: "DEFAULT_ADMIN_ROLE",
    eth_address: adminAddress,
  });

  console.log("✅ Admin sincronizzato DB ↔ Blockchain");
}
