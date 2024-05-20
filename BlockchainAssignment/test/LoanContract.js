const {time,loadFixture} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
  const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
  const { expect } = require("chai");
  
  describe("LoanContract", function () {
    async function deploy() {
        const [borrower, guarantor,lender] = await ethers.getSigners();
        const owner = await ethers.getSigners("0x7Db9C84846809362E37cBBfb61f4c9e63fD0c992");
        const LoanContract = await ethers.getContractFactory("LoanContract");
        const loanContract = await LoanContract.deploy();
    
        return { loanContract, owner, borrower, guarantor, lender };
      }

    describe("LoanRequest", function () {

    it("Should allow borrower to request a loan", async function () {
        const { loanContract, owner, borrower } = await loadFixture(deploy);
        const amount = 1000;
        const dueDate = Math.floor(Date.now() / 1000) + 3600; 
        const interest = 100;
        
        await loanContract.connect(borrower).requestLoan(amount, dueDate, interest);
        const loan = await loanContract.loans(0);
    
        expect(loan.borrower).to.equal(borrower.address);
        expect(loan.amount).to.equal(amount);
        expect(loan.dueDate).to.equal(dueDate);
        expect(loan.interest).to.equal(interest);
        expect(loan.requestActive).to.be.true;
        expect(loan.guarantor).to.equal("0x0000000000000000000000000000000000000000");
        expect(loan.lender).to.equal("0x0000000000000000000000000000000000000000");
        expect(loan.guarantorInterest).to.equal(0);
        expect(loan.lenderInterest).to.equal(0);
        expect(loan.guarantorFound).to.be.false;
        expect(loan.guarantorAccepted).to.be.false;
        expect(loan.lenderFound).to.be.false;
      });
    
  
    it("Should revert if amount is not greater than 0", async function () {
    const { loanContract, owner, borrower } = await loadFixture(deploy);
    const amount = 0;
    const dueDate = Math.floor(Date.now() / 1000) + 3600; 
    const interest = 100;
    
    await expect(
      loanContract.connect(borrower).requestLoan(amount, dueDate, interest)
    ).to.be.revertedWith("Amount must be greater than 0");
  });

  it("Should revert if interest is not greater than 0", async function () {
    const { loanContract, owner, borrower } = await loadFixture(deploy);
    const amount = 1000;
    const dueDate = Math.floor(Date.now() / 1000) + 3600; 
    const interest = 0;
    
    await expect(
      loanContract.connect(borrower).requestLoan(amount, dueDate, interest)
    ).to.be.revertedWith("Interest must be greater than 0");
  });

  it("Should revert if due date is not in the future", async function () {
    const { loanContract, owner, borrower } = await loadFixture(deploy);
    const amount = 1000;
    const dueDate = Math.floor(Date.now() / 1000) - 3600; 
    const interest = 100;
    
    await expect(
      loanContract.connect(borrower).requestLoan(amount, dueDate, interest)
    ).to.be.revertedWith("Due date must be in the future");
  });
});
  });