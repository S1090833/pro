// src/daos/userDao.ts
import { User, UserRole } from "../models/user";

export const userDao = {
  async createUser(email: string, password_hash: string, role: UserRole, ethAddress: string) {
    return User.create({
      email,
      password_hash,
      role,
      eth_address: ethAddress,
    });
  },

  async findByEmail(email: string) {
    return User.findOne({ where: { email } });
  },

  async listUsers() {
    return User.findAll({ order: [["id", "ASC"]] });
  },

  async getById(id: number) {
    return User.findByPk(id);
  },

  async updateUser(id: number, role?: UserRole) {
    const user = await User.findByPk(id);
    if (!user) return null;
    if (role) user.role = role;
    await user.save();
    return user;
  },

  async deleteUser(id: number) {
    const deletedCount = await User.destroy({ where: { id } });
    return deletedCount > 0;
  },
};
