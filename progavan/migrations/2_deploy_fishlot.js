const RolesManager = artifacts.require("RolesManager");
const FishLotNFT = artifacts.require("FishLotNFT");

module.exports = async function (deployer) {
  const rolesManager = await RolesManager.deployed();

  await deployer.deploy(
    FishLotNFT,
    rolesManager.address   
  );
};
