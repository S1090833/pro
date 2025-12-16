import { lotDao } from "../daos/lotDao";
import { lotContract, web3, rolesManagerContract } from "../blockchain/fishLotWeb3";
import { getFAOArea } from "../geo/faoService";

const FISHER_ROLE_HASH = web3.utils.keccak256("FISHER_ROLE");

export const lotService = {
  async createLot(payload: {
    species: string;
    quantity: number;
    lat: number;
    lon: number;
    vessel: string;
    callerEthAddress: string;
  }) {
    console.log("Payload ricevuto in createLot:", payload);

    if (!payload.callerEthAddress || !web3.utils.isAddress(payload.callerEthAddress)) {
      throw new Error("callerEthAddress non valido o mancante");
    }

    // Controllo ruolo FISHER_ROLE on-chain su RolesManager
    const hasRole = await rolesManagerContract.methods
      .hasRolePublic(FISHER_ROLE_HASH, payload.callerEthAddress)
      .call();

    if (!hasRole) {
      throw new Error("L'account non ha il ruolo FISHER_ROLE");
    }

    // Calcolo area FAO dalla lat/lon
    const faoArea = getFAOArea(payload.lat, payload.lon);
    if (!faoArea) {
      throw new Error("Coordinate fuori dalle aree FAO conosciute");
    }

    const from = payload.callerEthAddress;
    console.log("Caller address (from):", from);

    // Stima del gas
    const gasEstimate = await lotContract.methods
      .mintLot(
        payload.callerEthAddress,
        payload.species,
        payload.quantity,
        faoArea, // usa area FAO calcolata
        payload.vessel
      )
      .estimateGas({ from });

    console.log("Gas stimato per mintLot:", gasEstimate);

    // Chiamata on-chain mintLot con gas stimato + margine
    const tx = await lotContract.methods
      .mintLot(
        payload.callerEthAddress,
        payload.species,
        payload.quantity,
        faoArea,
        payload.vessel
      )
      .send({ from, gas: gasEstimate + 10000 });

    console.log("Transaction result:", tx);

    // Ottieni tokenId dall’evento Transfer o fallback
    let tokenId: number | null = null;
    if (tx.events && tx.events.Transfer && tx.events.Transfer.returnValues) {
      tokenId = Number(tx.events.Transfer.returnValues.tokenId);
    } else {
      const t = await lotContract.methods._tokenIds().call().catch(() => null);
      if (t) tokenId = Number(t);
    }
    if (tokenId === null) throw new Error("Impossibile leggere tokenId dalla tx");

    // Salvataggio su DB
    const db = await lotDao.create({
      tokenId,
      owner: payload.callerEthAddress,
      species: payload.species,
      quantity: payload.quantity,
      area: faoArea,
      vessel: payload.vessel,
      state: "FISHED",
    });

    await lotDao.addHistory(db.id, "FISHER", payload.callerEthAddress);

    return { tx, db, tokenId };
  },

  async advanceState(tokenId: number, actorEthAddress: string) {
  if (!actorEthAddress || !web3.utils.isAddress(actorEthAddress)) {
    throw new Error("actorEthAddress non valido o mancante");
  }
  const from = actorEthAddress;

  const gasEstimate = await lotContract.methods
    .advanceState(tokenId)
    .estimateGas({ from });

  const tx = await lotContract.methods.advanceState(tokenId).send({ from, gas: gasEstimate + 10000 });

  const lotOnChain = await lotContract.methods.getLot(tokenId).call();
  const stateEnumIndex = Number(lotOnChain.state);
  const stateNames = ["FISHED", "PROCESSING", "DISTRIBUTING", "RETAILING", "SOLD"];
  const newState = stateNames[stateEnumIndex];
  const completed = newState === "SOLD";

  const updated = await lotDao.updateStateByToken(tokenId, newState, completed);

  if (!updated) {
    throw new Error("Lotto non trovato dopo l'aggiornamento");
  }

  await lotDao.addHistory(updated.id, newState, from);

  return { updated, tx };
},

  async listLots() {
    return lotDao.listAll();
  },

  async getLot(tokenId: number) {
    const dbLot = await lotDao.findByToken(tokenId);
    if (!dbLot) return null;
    const history = await lotDao.getHistory(dbLot.id);
    return { ...dbLot, history };
  },

  async getHistoryOnChain(tokenId: number) {
    const rawLot = await lotContract.methods.getLot(tokenId).call();
    const rawHistory = await lotContract.methods.getHistory(tokenId).call();
    const stateNames = ["FISHED", "PROCESSING", "DISTRIBUTING", "RETAILING", "SOLD"];
    const lot = {
      id: Number(rawLot.id),
      species: rawLot.species,
      quantity: Number(rawLot.quantity),
      area: rawLot.area,
      vessel: rawLot.vessel,
      stateIndex: Number(rawLot.state),
      state: stateNames[Number(rawLot.state)],
      completed: rawLot.completed,
    };
    const history = rawHistory.map((h: any) => ({
      stepIndex: Number(h.step),
      state: stateNames[Number(h.step)],
      timestamp: Number(h.timestamp),
      actor: h.actor,
    }));
    return {
      tokenId,
      lot,
      history,
    };
  },
};
