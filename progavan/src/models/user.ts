// src/models/user.ts
import { DataTypes, Model, Optional } from "sequelize";
import SequelizeSingleton from "../config/db";

const sequelize = SequelizeSingleton.getInstance();

export type UserRole =
  | "DEFAULT_ADMIN_ROLE"
  | "FISHER_ROLE"
  | "PROCESSOR_ROLE"
  | "DISTRIBUTOR_ROLE"
  | "RETAILER_ROLE";

interface UserAttributes {
  id: number;
  email: string;
  password_hash: string;
  role: UserRole;
  eth_address: string;
  created_at?: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, "id" | "created_at"> {}

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public email!: string;
  public password_hash!: string;
  public role!: UserRole;
  public eth_address!: string;
  public readonly created_at!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING(255),
      unique: true,
      allowNull: false,
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    eth_address: {
      type: DataTypes.STRING(42),
      unique: true,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "users",
    timestamps: false, 
  }
);
