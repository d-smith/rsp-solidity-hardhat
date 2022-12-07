
const { expect } = require("chai");

const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");


describe("RockPaperScissors contract", function () {
  
  async function deployRPSFixture() {
    // Get the ContractFactory and Signers here.
    const RockPaperScissors = await ethers.getContractFactory("RockPaperScissors");
    const [owner, addr1, addr2] = await ethers.getSigners();

    
    const hardhatRCP = await RockPaperScissors.deploy();

    await hardhatRCP.deployed();

    return { RockPaperScissors, hardhatRCP, owner, addr1, addr2 };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
     
      const { hardhatRCP, owner } = await loadFixture(deployRPSFixture);
      expect(await hardhatRCP.owner()).to.equal(owner.address);
    });
  });

  describe("RockPaperScissors", function() {
    it("should allow a tie game", async function() {
        const { hardhatRCP, owner, addr1, addr2 } = await loadFixture(deployRPSFixture);
        await expect(
            hardhatRCP.connect(addr1).registerToPlay()
        ).to.not.be.reverted;

        await expect(
            hardhatRCP.connect(addr2).registerToPlay()
        ).to.not.be.reverted;

        let rockseed = ethers.utils.soliditySha256(['string','string'],['rock','seed']);
        console.log(rockseed);
        await expect(
            hardhatRCP.connect(addr1).throwDown(rockseed)
        ).to.not.be.reverted;

        await expect(
            hardhatRCP.connect(addr2).throwDown(rockseed)
        ).to.not.be.reverted;
    });

  })

  /*
  describe("Transactions", function () {
    it("Should transfer tokens between accounts", async function () {
      const { hardhatToken, owner, addr1, addr2 } = await loadFixture(
        deployTokenFixture
      );
      // Transfer 50 tokens from owner to addr1
      await expect(
        hardhatToken.transfer(addr1.address, 50)
      ).to.changeTokenBalances(hardhatToken, [owner, addr1], [-50, 50]);

      // Transfer 50 tokens from addr1 to addr2
      // We use .connect(signer) to send a transaction from another account
      await expect(
        hardhatToken.connect(addr1).transfer(addr2.address, 50)
      ).to.changeTokenBalances(hardhatToken, [addr1, addr2], [-50, 50]);
    });

    it("should emit Transfer events", async function () {
      const { hardhatToken, owner, addr1, addr2 } = await loadFixture(
        deployTokenFixture
      );

      // Transfer 50 tokens from owner to addr1
      await expect(hardhatToken.transfer(addr1.address, 50))
        .to.emit(hardhatToken, "Transfer")
        .withArgs(owner.address, addr1.address, 50);

      // Transfer 50 tokens from addr1 to addr2
      // We use .connect(signer) to send a transaction from another account
      await expect(hardhatToken.connect(addr1).transfer(addr2.address, 50))
        .to.emit(hardhatToken, "Transfer")
        .withArgs(addr1.address, addr2.address, 50);
    });

    it("Should fail if sender doesn't have enough tokens", async function () {
      const { hardhatToken, owner, addr1 } = await loadFixture(
        deployTokenFixture
      );
      const initialOwnerBalance = await hardhatToken.balanceOf(owner.address);

      // Try to send 1 token from addr1 (0 tokens) to owner.
      // `require` will evaluate false and revert the transaction.
      await expect(
        hardhatToken.connect(addr1).transfer(owner.address, 1)
      ).to.be.revertedWith("Not enough tokens");

      // Owner balance shouldn't have changed.
      expect(await hardhatToken.balanceOf(owner.address)).to.equal(
        initialOwnerBalance
      );
    });
    
  });*/
});