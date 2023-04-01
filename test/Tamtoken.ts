import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import { utils } from "ethers";

describe("Tamtoken", function () {
  
  async function deployOneTokenContract() {
    
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount, user, otherUser] = await ethers.getSigners();

    const Tamtoken = await ethers.getContractFactory("Tamtoken");
    const tam = await Tamtoken.deploy();

    await tam.deployed();
    
    return { tam, owner, otherAccount, user , otherUser};
  }

  describe("Deployment", function (){
    it("Should set the correct initial total supply", async function(){
      const {tam} = await loadFixture(deployOneTokenContract);

      const totalSupply = await tam.totalSupply();

     await expect(totalSupply).to.equal(ethers.utils.parseEther("900000000000000000"));
    })

    it("Should set the correct token name and symbol", async function(){
      const{tam} = await loadFixture(deployOneTokenContract);

      const tokenname = await tam.name();
      const tokensymbol = await tam.symbol();

      expect(tokenname, tokensymbol).to.equal("Tamtoken", "TAM");
    })

    it("Should have minted token successfully to the owner", async function(){
      const{tam, owner} = await loadFixture(deployOneTokenContract);

      await expect(await tam.balanceOf(owner.address)).to.equal(await tam.totalSupply());
    })
  })

  describe("Token Transfer", function (){
    it('Should transfer tokens correctly', async () => {
      const {tam, owner, user} = await loadFixture(deployOneTokenContract);
       
      await tam.connect(owner).transfer(user.address, ethers.utils.parseEther("10"));
      
      const userBal = await tam.balanceOf(user.address);

      expect(userBal).to.equal(ethers.utils.parseEther("10"));
      
    });

    it("Should revert if account has Insufficient token balance", async function(){
      const {tam, otherAccount, otherUser} = await loadFixture(deployOneTokenContract);
      
      await expect (tam.connect(otherAccount).transfer(otherUser.address, ethers.utils.parseEther("5"))).to.be.revertedWithCustomError(tam, "InsufficientToken");
    })

    it('Should prevent transfers to the zero address', async () => {
      const {tam, owner} = await loadFixture(deployOneTokenContract);
      
      await expect(tam.connect(owner).transfer('0x0000000000000000000000000000000000000000', 100)).to.be.revertedWithCustomError(tam, "AddressZero");
    });
  })


  describe("Token Approvals", function(){
    it("Should revert if approval is not granted to an account", async function(){
      const {tam, otherAccount, owner} = await loadFixture(deployOneTokenContract);

      await expect(tam.connect(otherAccount).transferFrom(owner.address, otherAccount.address, ethers.utils.parseEther("1") )).to.be.revertedWithCustomError(tam, "InsufficientAllowance");
    })

    it("Should revert if token holder's account balance is low", async function(){
      const {tam, otherAccount, owner, user} = await loadFixture(deployOneTokenContract);

      const Approval = await tam.connect(owner).approve(otherAccount.address, ethers.utils.parseEther("50"));
      await Approval.wait();

      const TransferOut = await tam.connect(otherAccount).transferFrom(owner.address, otherAccount.address, ethers.utils.parseEther("10"));
      await TransferOut.wait();
  
      const approveAnotheracc = await tam.connect(otherAccount).transfer(user.address, ethers.utils.parseEther("5"));
      await approveAnotheracc.wait();

      //owner wants to decrease otherAccount's token allowance since he hasn't transfered all the token out
      
      await expect(tam.connect(owner).decreaseAllowance(otherAccount.address, ethers.utils.parseEther("45"))).to.be.revertedWithCustomError(tam, "InsufficientToken");

    })

    it("Should revert if account has insufficient allowance", async function(){
      const {tam, otherAccount, owner} = await loadFixture(deployOneTokenContract);
      
      const Approval = await tam.connect(owner).approve(otherAccount.address, ethers.utils.parseEther("5"));
      await Approval.wait();
      
      console.log("other", Approval);

      await expect(tam.connect(otherAccount).transferFrom(owner.address, otherAccount.address, ethers.utils.parseEther("7"))).to.be.revertedWithCustomError(tam, "InsufficientAllowance");
    })

  
  })


  describe ("Burning Token", function(){
    it("Should revert if caller does not have access to burn", async function(){
       const {tam, otherAccount, owner} = await loadFixture(deployOneTokenContract);

       const tx = await tam.connect(owner).transfer(otherAccount.address, ethers.utils.parseEther("200"));
       await tx.wait();

       const burnAmount = ethers.utils.parseEther("100");

       await expect(tam.connect(otherAccount).burn(otherAccount.address, burnAmount)).to.be.revertedWithCustomError(tam, "OnlyMinter");

    })

    it("Should burn token successfully", async function(){
      const {tam, otherAccount, owner} = await loadFixture(deployOneTokenContract);
      
      const burnAmount = ethers.utils.parseEther("100000000000000000")

      const tx = await tam.connect(owner).burn(owner.address, burnAmount);
      await tx.wait();

      const bal = await tam.balanceOf(owner.address);
      await expect (bal).to.equal(ethers.utils.parseEther("800000000000000000"))
    })

  })


  describe ("Minting Token", function(){
    it("Should revert if caller doesnt have a Minter Role", async function(){
      const {tam, otherAccount, owner} = await loadFixture(deployOneTokenContract);
  
      const tx = await tam.connect(owner).transfer(otherAccount.address, ethers.utils.parseEther("200"));
       await tx.wait();

       const mintAmount = ethers.utils.parseEther("2000000");

       await expect(tam.connect(otherAccount).mint(otherAccount.address, mintAmount)).to.be.revertedWithCustomError(tam, "OnlyMinter");
      
    });

    it("Should mint token successfully", async function(){
      const {tam, owner} = await loadFixture(deployOneTokenContract);
      
      const mintAmount = ethers.utils.parseEther("100000000000000000")

      const tx = await tam.connect(owner).mint(owner.address, mintAmount);
      await tx.wait();

      const total = await tam.totalSupply();
      await expect (total).to.equal(ethers.utils.parseEther("1000000000000000000"))
    })

    it("Should revert on minting if minting is finished", async function(){
      const {tam, owner} = await loadFixture(deployOneTokenContract);
      
      const mintAmount = ethers.utils.parseEther("100000000000000000");

      const tx = await tam.connect(owner).finishMinting();
      await tx.wait();

      await expect(tam.connect(owner).mint(owner.address, mintAmount)).to.be.revertedWithCustomError(tam, "MintingHasFinished");

    })
    

  })

  
});
