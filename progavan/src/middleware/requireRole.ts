import { Request, Response, NextFunction } from "express";
import { contract, web3 } from "../blockchain/web3";

const DEFAULT_ADMIN_ROLE =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

export function requireRole(expectedRole: string) {
  return async (req: any, res: Response, next: NextFunction) => {
    try {
      const user = req.user;

      if (!user || !user.eth_address) {
        return res.status(401).json({ error: "Utente non autenticato" });
      }

      // DEFAULT_ADMIN_ROLE è 0x00, NON keccak256
      const roleHash =
        expectedRole === "DEFAULT_ADMIN_ROLE"
          ? DEFAULT_ADMIN_ROLE
          : web3.utils.keccak256(expectedRole);

      const hasRole = await contract.methods
        .hasRolePublic(roleHash, user.eth_address)
        .call();

      console.log("DEBUG role check:", {
        expectedRole,
        roleHash,
        eth: user.eth_address,
        hasRole
      });

      if (!hasRole) {
        return res.status(403).json({
          error: "Non hai il ruolo richiesto on-chain"
        });
      }

      next();
    } catch (err) {
      console.error("On-chain role error:", err);
      res.status(500).json({ error: "Errore verifica ruolo blockchain" });
    }
  };
}
