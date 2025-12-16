// src/models/lot.ts
import { DataTypes, Model, Optional } from "sequelize";
import SequelizeSingleton from "../config/db";

const sequelize = SequelizeSingleton.getInstance();

interface LotAttributes {
  id: number;
  token_id: number;
  owner_eth_address: string;
  species: string;
  quantity: number;
  coordinates_or_area: string;
  vessel: string;
  state: string;
  approved: boolean;
  completed: boolean;
  completed_at?: Date | null;
  created_at?: Date;
}

interface LotCreationAttributes extends Optional<LotAttributes, "id" | "approved" | "completed" | "completed_at" | "created_at"> {}

export class Lot extends Model<LotAttributes, LotCreationAttributes> implements LotAttributes {
  public id!: number;
  public token_id!: number;
  public owner_eth_address!: string;
  public species!: string;
  public quantity!: number;
  public coordinates_or_area!: string;
  public vessel!: string;
  public state!: string;
  public approved!: boolean;
  public completed!: boolean;
  public completed_at?: Date | null;
  public readonly created_at!: Date;
}

Lot.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    token_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    owner_eth_address: {
      type: DataTypes.STRING(42),
      allowNull: false,
    },
    species: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    coordinates_or_area: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    vessel: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "FISHED",
    },
    approved: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    completed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "lots",
    timestamps: false,
  }
);
