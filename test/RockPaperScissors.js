
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

    async function deployRPSFixtureWith2Players() {
        // Get the ContractFactory and Signers here.
        const RockPaperScissors = await ethers.getContractFactory("RockPaperScissors");
        const [owner, addr1, addr2] = await ethers.getSigners();


        const hardhatRCP = await RockPaperScissors.deploy();
        hardhatRCP.connect(addr1).registerToPlay();
        hardhatRCP.connect(addr2).registerToPlay()

        await hardhatRCP.deployed();

        return { RockPaperScissors, hardhatRCP, owner, addr1, addr2 };
    }

    describe("Deployment", function () {
        it("Should set the right owner", async function () {

            const { hardhatRCP, owner } = await loadFixture(deployRPSFixtureWith2Players);
            expect(await hardhatRCP.owner()).to.equal(owner.address);
        });
    });

    describe("Input checks", function() {
        it("should not let player 1 and player2 be the same address", async function() {
            const { hardhatRCP, owner, addr1, addr2 } = await loadFixture(deployRPSFixture);
            await hardhatRCP.connect(addr1).registerToPlay();
            await expect(
                hardhatRCP.connect(addr1).registerToPlay()
            ).to.be.reverted;
        });
    });

    describe("RockPaperScissors", function () {
        it("should allow a tie game", async function () {
            const { hardhatRCP, owner, addr1, addr2 } = await loadFixture(deployRPSFixtureWith2Players);

            let rockseed = ethers.utils.soliditySha256(['uint', 'string'], [1, 'seed']);
            await expect(
                hardhatRCP.connect(addr1).throwDown(rockseed)
            ).to.not.be.reverted;

            await expect(
                hardhatRCP.connect(addr2).throwDown(rockseed)
            ).to.not.be.reverted;

            await expect(
                hardhatRCP.connect(addr1).revealMove(1, "seed")
            ).to.not.be.reverted;

            await expect(
                hardhatRCP.connect(addr2).revealMove(1, "seed")
            ).to.emit(hardhatRCP, "StaleMate");

        });

        it("should allow a winner", async function () {
            const { hardhatRCP, owner, addr1, addr2 } = await loadFixture(deployRPSFixtureWith2Players);

            let rockseed = ethers.utils.soliditySha256(['uint', 'string'], [1, 'seed']);
            let scissorsseed = ethers.utils.soliditySha256(['uint', 'string'], [3, 'seed']);
            await expect(
                hardhatRCP.connect(addr1).throwDown(rockseed)
            ).to.not.be.reverted;

            await expect(
                hardhatRCP.connect(addr2).throwDown(scissorsseed)
            ).to.not.be.reverted;

            await expect(
                hardhatRCP.connect(addr1).revealMove(1, "seed")
            ).to.not.be.reverted;

            await expect(
                hardhatRCP.connect(addr2).revealMove(3, "seed")
            ).to.emit(hardhatRCP, "Winner")
                .withArgs(addr1.address);

        });


        it("should allow a new game after completion of first game", async function () {
            const { hardhatRCP, owner, addr1, addr2 } = await loadFixture(deployRPSFixtureWith2Players);

            let rockseed = ethers.utils.soliditySha256(['uint', 'string'], [1, 'seed']);
            await expect(
                hardhatRCP.connect(addr1).throwDown(rockseed)
            ).to.not.be.reverted;

            await expect(
                hardhatRCP.connect(addr2).throwDown(rockseed)
            ).to.not.be.reverted;

            await expect(
                hardhatRCP.connect(addr1).revealMove(1, "seed")
            ).to.not.be.reverted;

            await expect(
                hardhatRCP.connect(addr2).revealMove(1, "seed")
            ).to.emit(hardhatRCP, "StaleMate");


            await expect(
                hardhatRCP.connect(addr2).registerToPlay()
            ).to.not.be.reverted;


        });

    })

    
});