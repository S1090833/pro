import { userDao } from "../daos/userDao";
import { contract, web3 } from "../blockchain/web3";
import { isAddress } from "web3-utils";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


export const userService = {
  async register(
    email: string,
    password: string,
    role: string,
    ethAddress: string
  ) {
    if (!isAddress(ethAddress)) {
      throw new Error("Indirizzo Ethereum non valido");
    }

    // Controlla se l'email è già registrata
    const existingUser = await userDao.findByEmail(email);
    if (existingUser) {
      throw new Error("Email già registrata");
    }

    const hashed = await bcrypt.hash(password, 10);

    // 1. DB insert
    const user = await userDao.createUser(email, hashed, role as any, ethAddress);

    // 2. Assegna ruolo nella blockchain
    const accounts = await web3.eth.getAccounts();
    const roleHash = web3.utils.keccak256(role);

    await contract.methods
      .grantRoleTo(roleHash, ethAddress)
      .send({ from: accounts[0], gas: 200000 });

    return user;
  },

  async login(email: string, password: string) {
    const user = await userDao.findByEmail(email);
    if (!user) throw new Error("Utente non trovato");

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) throw new Error("Credenziali errate");

    // Genera JWT qui (esempio minimo)
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, eth_address: user.eth_address },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        ethAddress: user.eth_address,
      },
      token,
    };
  }
};
