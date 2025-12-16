const RolesManager = artifacts.require("RolesManager");

module.exports = async function (deployer, network, accounts) {
  console.log("Accounts:", accounts);

  const admin = accounts[0]; // primo account di Ganache

  await deployer.deploy(RolesManager, admin);
};