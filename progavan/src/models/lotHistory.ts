// src/models/lotHistory.ts
import { DataTypes, Model, Optional } from "sequelize";
import SequelizeSingleton from "../config/db";
import { Lot } from "./Lot";

const sequelize = SequelizeSingleton.getInstance();

interface LotHistoryAttributes {
  id: number;
  lot_id: number;
  step: string;
  timestamp: Date;
  eth_address: string;
}

interface LotHistoryCreationAttributes extends Optional<LotHistoryAttributes, "id" | "timestamp"> {}

export class LotHistory extends Model<LotHistoryAttributes, LotHistoryCreationAttributes> implements LotHistoryAttributes {
  public id!: number;
  public lot_id!: number;
  public step!: string;
  public timestamp!: Date;
  public eth_address!: string;
}

LotHistory.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    lot_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: Lot,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    step: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    eth_address: {
      type: DataTypes.STRING(42),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "lot_history",
    timestamps: false,
  }
);

Lot.hasMany(LotHistory, { foreignKey: "lot_id" });
LotHistory.belongsTo(Lot, { foreignKey: "lot_id" });
