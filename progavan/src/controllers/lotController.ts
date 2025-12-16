import { Request, Response } from "express";
import { lotService } from "../services/lotService";

export const lotController = {
  async create(req: any, res: Response) {
    try {
      const payload = req.body;

      // Prendo eth_address dal JWT e lo inserisco nel payload per il service
      payload.callerEthAddress = req.user?.eth_address;

      if (!payload.callerEthAddress) {
        return res.status(401).json({ error: "Utente non autenticato o eth_address mancante" });
      }

      // Validazioni di base, specie, quantity, etc, possono essere aggiunte qui

      const result = await lotService.createLot(payload);
      res.status(201).json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },

  async advance(req: any, res: Response) {
    try {
      const tokenId = Number(req.params.tokenId);

      // Prendo eth_address dal JWT o dal body
      const actor = req.user?.eth_address || req.body.actorEth || null;

      if (!actor) {
        return res.status(400).json({ error: "Actor eth address mancante" });
      }

      const result = await lotService.advanceState(tokenId, actor);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },

  async list(req: any, res: Response) {
    try {
      const lots = await lotService.listLots();
      res.json(lots);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  async get(req: any, res: Response) {
    try {
      const tokenId = Number(req.params.tokenId);
      const lot = await lotService.getLot(tokenId);
      if (!lot) return res.status(404).json({ error: "Not found" });
      res.json(lot);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },
  async getHistory(req: any, res: Response) {
  try {
    const tokenId = Number(req.params.tokenId);

    if (isNaN(tokenId)) {
      return res.status(400).json({ error: "tokenId non valido" });
    }

    const history = await lotService.getHistoryOnChain(tokenId);
    res.json(history);

  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
},

};
