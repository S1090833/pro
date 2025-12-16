import Web3 from "web3";
import fs from "fs";
import path from "path";

const web3 = new Web3(process.env.RPC_URL!);

// ABI e contratto NFT
const lotABI = JSON.parse(fs.readFileSync(path.join(__dirname, "../../build/contracts/FishLotNFT.json"), "utf8")).abi;
export const lotContract = new web3.eth.Contract(lotABI, process.env.LOT_CONTRACT_ADDRESS!);

// ABI e contratto RolesManager
const rolesManagerABI = JSON.parse(fs.readFileSync(path.join(__dirname, "../../build/contracts/RolesManager.json"), "utf8")).abi;
export const rolesManagerContract = new web3.eth.Contract(rolesManagerABI, process.env.CONTRACT_ADDRESS!);

export { web3 };
