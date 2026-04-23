import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployEscrow: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const result = await deploy("Escrow", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });

  console.log(`\n🔐 Escrow contract deployed at: ${result.address}`);
  console.log(`   Deployer (Yunus Başkan): ${deployer}`);
  console.log(`\n👉 .env.local dosyasına ekle:`);
  console.log(`   NEXT_PUBLIC_ESCROW_ADDRESS=${result.address}\n`);
};

export default deployEscrow;
deployEscrow.tags = ["Escrow"];
