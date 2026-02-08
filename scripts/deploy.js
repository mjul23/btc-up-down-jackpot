const hre = require("hardhat");

async function main() {
  console.log("Déploiement du smart contract BTCUpDownJackpot...");

  // Déployer le contrat
  const BTCUpDownJackpot = await hre.ethers.getContractFactory("BTCUpDownJackpot");
  const btcUpDownJackpot = await BTCUpDownJackpot.deploy();
  
  await btcUpDownJackpot.deployed();
  
  console.log(`✅ Contrat déployé à l'adresse: ${btcUpDownJackpot.address}`);
  
  // Afficher les informations importantes
  console.log("\n📋 Informations de déploiement:");
  console.log(`- Adresse du contrat: ${btcUpDownJackpot.address}`);
  console.log(`- Network: ${hre.network.name}`);
  console.log(`- Chain ID: ${hre.network.config.chainId}`);
  
  // Vérifier que le contrat est bien déployé
  console.log("\n🔍 Vérification du contrat...");
  const owner = await btcUpDownJackpot.owner();
  console.log(`- Owner: ${owner}`);
  
  const nextBetTime = await btcUpDownJackpot.nextBetTime();
  const bettingActive = await btcUpDownJackpot.bettingActive();
  console.log(`- Prochain pari: ${new Date(nextBetTime * 1000).toLocaleString()}`);
  console.log(`- Paris actifs: ${bettingActive ? "Oui" : "Non"}`);
  
  // Afficher les commandes suivantes
  console.log("\n🚀 Étapes suivantes:");
  console.log("1. Vérifier le contrat sur BaseScan:");
  console.log(`   https://basescan.org/address/${btcUpDownJackpot.address}`);
  
  console.log("2. Configurer l'adresse du contrat dans le frontend:");
  console.log(`   CONTRACT_ADDRESS="${btcUpDownJackpot.address}"`);
  
  console.log("3. Tester le contrat:");
  console.log("   npm test");
  
  console.log("\n⚠️  IMPORTANT:");
  console.log("- N'oubliez pas de configurer les variables d'environnement");
  console.log("- Testez le contrat en développement avant de l'utiliser en production");
  console.log("- Sauvegardez l'adresse du contrat et le code source");
}

// Gestion des erreurs
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });