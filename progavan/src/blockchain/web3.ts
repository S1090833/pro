import Web3 from "web3";
import * as fs from "fs";
import * as path from "path";

const ABI = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "../../build/contracts/RolesManager.json"),
    "utf8"
  )
).abi;

export const web3 = new Web3(process.env.RPC_URL!);

export const contract = new web3.eth.Contract(
  ABI,
  process.env.CONTRACT_ADDRESS!
);