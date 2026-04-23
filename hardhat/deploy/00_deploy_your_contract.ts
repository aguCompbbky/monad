import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

/**
 * Deploys the GariEscrow marketplace escrow contract.
 *
 * Run `yarn deploy --network monadTestnet` from the monorepo root after
 * generating / importing a deployer account funded with MON.
 */
const deployGariEscrow: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  await deploy("GariEscrow", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });

  const gariEscrow = await hre.ethers.getContract("GariEscrow", deployer);
  const address = await gariEscrow.getAddress();
  console.log("📦 GariEscrow deployed at:", address);
};

export default deployGariEscrow;

deployGariEscrow.tags = ["GariEscrow"];
