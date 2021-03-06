const { chai, BN, tokenMigrationVars, testHelpers } = require("./setup.js");
const { tokenName, tokenSymbol, tokenTotalSupply } = tokenMigrationVars;
const { expectRevert } = testHelpers;
const { expect } = chai;

const ERC20Token = artifacts.require("./ERC20Token.sol");

contract("ERC20Token", async function(accounts) {

    const [ tokenDeployer, recepient, ...rest ] = accounts;
    let preDeployedInstance;

    function getFreshInstance() {
        return ERC20Token.new(tokenName, tokenSymbol, tokenTotalSupply, { from: tokenDeployer});
    }

    before("prepare pre-deployed instance", async function() {
        preDeployedInstance = await ERC20Token.deployed();
    })

    it("should set max supply of token correctly", async function() {        
        const expectedResult = tokenTotalSupply;
        const actualMaxSupply = await preDeployedInstance.maxSupply();

        return expect(actualMaxSupply).to.be.a.bignumber.that.equal(new BN(expectedResult));
    });

    it("should allow tokenDeployer to mint tokens", async function() {
        const expectedResult = new BN(1000000);
 
        await preDeployedInstance.mint(expectedResult, recepient, { from: tokenDeployer });
        const actualAmount = await preDeployedInstance.balanceOf(recepient);

        return expect(actualAmount).to.be.a.bignumber.that.equal(expectedResult);
    });

    it("should reject mint() if supply would exceed max supply", async function() {
        const freshInstance = await getFreshInstance();
        await freshInstance.mint(tokenTotalSupply, recepient, { from: tokenDeployer });
        
        await expectRevert(
            freshInstance.mint(1, recepient, { from: tokenDeployer }),
            "ERC20Token: Amount exceeding max supply."
        )
    })

    it("should reject mint() from NOT owner address", async function() {
        await expectRevert(
            preDeployedInstance.mint(1, recepient, { from: recepient }),
            "Ownable: caller is not the owner."
        )
    })
})