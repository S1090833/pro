import bcrypt from "bcrypt";
import { User } from "../models/user";
import { contract, web3 } from "../blockchain/web3";
import { Op } from "sequelize";  // <- Import corretto di Op

export async function syncAdminUser() {
  const accounts = await web3.eth.getAccounts();
  const adminAddress = accounts[0]; // di solito è admin

  if (!adminAddress) {
    throw new Error("ADMIN_ADDRESS mancante");
  }

  // 1. Verifica se è davvero admin on-chain
  const role = "0x0000000000000000000000000000000000000000000000000000000000000000";

  const isAdmin = await contract.methods
    .hasRolePublic(role, adminAddress)
    .call();

  if (!isAdmin) {
    throw new Error("Questo address non è admin on-chain: " + adminAddress);
  }

  // 2. Verifica se l'admin esiste già nel DB (per email o eth_address)
  const existing = await User.findOne({
    where: {
      [Op.or]: [
        { eth_address: adminAddress },
        { email: "admin@system.local" }
      ]
    }
  });

  if (existing) {
    console.log("✅ Admin già presente nel DB");
    return;
  }

  // 3. Crea password hash
  const plainPassword = "admin";
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

  // 4. Inserisci nuovo admin nel DB con Sequelize
  await User.create({
    email: "admin@system.local",
    password_hash: hashedPassword,
    role: "DEFAULT_ADMIN_ROLE",
    eth_address: adminAddress,
  });

  console.log("✅ Admin sincronizzato DB ↔ Blockchain");
}
