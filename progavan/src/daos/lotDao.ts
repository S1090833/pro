// src/daos/lotDao.ts
import { Lot } from "../models/Lot";
import { LotHistory } from "../models/lotHistory";

export const lotDao = {
  async create(dbObj: {
    tokenId: number;
    requesterId?: number;
    owner: string;
    species: string;
    quantity: number;
    area: string;
    timestamp?: number;
    vessel: string;
    state?: string;
    approved?: boolean;
    completed?: boolean;
  }) {
    
    return Lot.create({
      token_id: dbObj.tokenId,
      owner_eth_address: dbObj.owner,
      species: dbObj.species,
      quantity: dbObj.quantity,
      coordinates_or_area: dbObj.area,
      vessel: dbObj.vessel,
      state: dbObj.state || "FISHED",
      approved: dbObj.approved || false,
      completed: dbObj.completed || false,
    });
  },

  async addHistory(lotId: number, step: string, eth: string, when?: string) {
    return LotHistory.create({
      lot_id: lotId,
      step,
      timestamp: when ? new Date(when) : new Date(),
      eth_address: eth,
    });
  },

  async updateStateByToken(tokenId: number, newState: string, completed = false) {
    const lot = await Lot.findOne({ where: { token_id: tokenId } });
    if (!lot) return null;

    lot.state = newState;
    lot.completed = completed;
    if (completed) {
      lot.completed_at = new Date();
    }
    await lot.save();
    return lot;
  },

  async findByToken(tokenId: number) {
    return Lot.findOne({ where: { token_id: tokenId } });
  },

  async listAll() {
    return Lot.findAll({ order: [["id", "DESC"]] });
  },

  async getHistory(lotId: number) {
    return LotHistory.findAll({
      where: { lot_id: lotId },
      order: [["id", "ASC"]],
      attributes: ["step", "timestamp", "eth_address"],
    });
  },
};
