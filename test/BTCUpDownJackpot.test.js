const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BTCUpDownJackpot", function () {
  let BTCUpDownJackpot;
  let contract;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    // Récupérer les signers
    [owner, addr1, addr2] = await ethers.getSigners();

    // Déployer le contrat
    BTCUpDownJackpot = await ethers.getContractFactory("BTCUpDownJackpot");
    contract = await BTCUpDownJackpot.deploy();
    await contract.deployed();
  });

  describe("Déploiement", function () {
    it("Devrait définir le bon owner", async function () {
      expect(await contract.owner()).to.equal(owner.address);
    });

    it("Devrait avoir un jackpot initial à 0", async function () {
      expect(await contract.jackpot()).to.equal(0);
    });

    it("Devrait avoir les paris activés", async function () {
      expect(await contract.bettingActive()).to.equal(true);
    });
  });

  describe("Paris", function () {
    it("Devrait autoriser un pari valide", async function () {
      const betAmount = ethers.utils.parseEther("0.1");
      
      await expect(
        contract.connect(addr1).placeBet(true, { value: betAmount })
      ).to.emit(contract, "BetPlaced")
        .withArgs(addr1.address, true, betAmount);
      
      // Vérifier que le pari enregistré
      const hasBet = await contract.hasBet(addr1.address);
      expect(hasBet).to.equal(true);
      
      // Vérifier que le jackpot a augmenté
      expect(await contract.jackpot()).to.equal(betAmount);
    });

    it("Devrait rejeter un pari avec montant incorrect", async function () {
      const wrongAmount = ethers.utils.parseEther("0.05");
      
      await expect(
        contract.connect(addr1).placeBet(true, { value: wrongAmount })
      ).to.be.revertedWith("Incorrect bet amount");
    });

    it("Devrait empêcher de parier deux fois le même jour", async function () {
      const betAmount = ethers.utils.parseEther("0.1");
      
      // Premier pari
      await contract.connect(addr1).placeBet(true, { value: betAmount });
      
      // Deuxième pari devrait échouer
      await expect(
        contract.connect(addr1).placeBet(false, { value: betAmount })
      ).to.be.revertedWith("Already placed a bet today");
    });

    it("Devrait autoriser plusieurs joueurs à parier", async function () {
      const betAmount = ethers.utils.parseEther("0.1");
      
      // Addr1 pari UP
      await contract.connect(addr1).placeBet(true, { value: betAmount });
      
      // Addr2 pari DOWN
      await contract.connect(addr2).placeBet(false, { value: betAmount });
      
      // Vérifier que les deux ont parié
      expect(await contract.hasBet(addr1.address)).to.equal(true);
      expect(await contract.hasBet(addr2.address)).to.equal(true);
      
      // Vérifier le jackpot
      expect(await contract.jackpot()).to.equal(betAmount.mul(2));
    });
  });

  describe("Traitement des résultats", function () {
    beforeEach(async function () {
      const betAmount = ethers.utils.parseEther("0.1");
      
      // Placer des paris
      await contract.connect(addr1).placeBet(true, { value: betAmount });
      await contract.connect(addr2).placeBet(false, { value: betAmount });
      
      // Avancer le temps pour que la période de pari se termine
      await ethers.provider.send("evm_increaseTime", [24 * 60 * 60]);
      await ethers.provider.send("evm_mine", []);
    });

    it("Devrait traiter un résultat UP", async function () {
      // Configurer le résultat (UP = true)
      await contract.setInitialPrice(50000);
      await contract.setFinalPrice(51000); // Prix plus haut = UP
      
      // Traiter le résultat
      await expect(contract.processResult())
        .to.emit(contract, "ResultProcessed");
      
      // Vérifier que les paris sont traités
      const bets = await contract.bets(0);
      expect(bets.won).to.equal(true); // Addr1 a parié UP
    });

    it("Devrait traiter un résultat DOWN", async function () {
      // Configurer le résultat (DOWN = false)
      await contract.setInitialPrice(50000);
      await contract.setFinalPrice(49000); // Prix plus bas = DOWN
      
      // Traiter le résultat
      await contract.processResult();
      
      // Vérifier que les paris sont traités
      const bets = await contract.bets(1);
      expect(bets.won).to.equal(true); // Addr2 a parié DOWN
    });

    it("Devrait traiter un résultat FLAT", async function () {
      // Configurer un résultat plat
      await contract.setInitialPrice(50000);
      await contract.setFinalPrice(50000); // Prix identique = FLAT
      
      // Traiter le résultat
      await expect(contract.processResult())
        .to.emit(contract, "ResultProcessed");
      
      // Vérifier que le jackpot est reporté
      const nextBetTime = await contract.nextBetTime();
      const bettingActive = await contract.bettingActive();
      
      expect(bettingActive).to.equal(false);
    });
  });

  describe("Retrait des fonds", function () {
    it("Devrait permettre au owner de retirer les fonds", async function () {
      const betAmount = ethers.utils.parseEther("0.1");
      const initialBalance = await ethers.provider.getBalance(owner.address);
      
      // Placer un pari
      await contract.connect(addr1).placeBet(true, { value: betAmount });
      
      // Terminer la période et traiter
      await ethers.provider.send("evm_increaseTime", [24 * 60 * 60]);
      await ethers.provider.send("evm_mine", []);
      await contract.setInitialPrice(50000);
      await contract.setFinalPrice(51000);
      await contract.processResult();
      
      // Retirer les fonds
      await expect(contract.withdrawFunds())
        .to.emit(contract, "FundsWithdrawn");
      
      const finalBalance = await ethers.provider.getBalance(owner.address);
      expect(finalBalance).to.be.gt(initialBalance);
    });

    it("Devrait empêcher de retirer pendant une période active", async function () {
      const betAmount = ethers.utils.parseEther("0.1");
      
      // Placer un pari
      await contract.connect(addr1).placeBet(true, { value: betAmount });
      
      // Essayer de retirer devrait échouer
      await expect(contract.withdrawFunds())
        .to.be.revertedWith("Cannot withdraw during active betting");
    });
  });

  describe("Statistiques des joueurs", function () {
    beforeEach(async function () {
      const betAmount = ethers.utils.parseEther("0.1");
      
      // Placer des paris
      await contract.connect(addr1).placeBet(true, { value: betAmount });
      await contract.connect(addr2).placeBet(false, { value: betAmount });
    });

    it("Devrait retourner les bonnes statistiques joueur", async function () {
      const stats = await contract.getPlayerStats(addr1.address);
      
      expect(stats.totalBet).to.equal(ethers.utils.parseEther("0.1"));
      expect(stats.totalBets).to.equal(1);
      expect(stats.totalWon).to.equal(0);
      expect(stats.betsWon).to.equal(0);
      expect(stats.hasBet).to.equal(true);
    });
  });

  describe("État des paris", function () {
    it("Devrait retourner l'état actuel", async function () {
      const state = await contract.getBettingState();
      
      expect(state.bettingActive).to.equal(true);
      expect(state.totalBets).to.equal(0);
      expect(state.jackpot).to.equal(0);
      expect(state.timeRemaining).to.be.gt(0);
    });
  });
});