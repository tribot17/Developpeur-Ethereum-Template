const { BN, ether } = require("@openzeppelin/test-helpers");
const { expect } = require("chai");
const Voting = artifacts.require("Voting");

contract("Voting", function (accounts) {
  const owner = accounts[0];

  beforeEach(async function () {
    this.VotingInstance = await Voting.new({ from: owner });
  });

  //-----------------------------------Changement d'état -----------------------------------//

  it("Passe de l'état VotingRegister à ProposalsRegisters ", async function () {
    //Charge la variable workflowsStatus
    let statusBefore = await this.VotingInstance.workflowStatus();

    //Excute la fonction startProposalsSession
    await this.VotingInstance.startProposalsSession();

    let statusAfter = await this.VotingInstance.workflowStatus();

    //statusBefore retourne un big number il faut donc convertir
    expect(statusBefore).to.be.a.bignumber.equal(
      await new BN(Voting.enums.WorkflowStatus.RegisteringVoters)
    );
    expect(statusAfter).to.be.a.bignumber.equal(
      await new BN(Voting.enums.WorkflowStatus.ProposalsRegistrationStarted)
    );
  });

  it("Passe de l'état ProposalsRegistrationStarted à ProposalsRegistrationEnded", async function () {
    //Il faut executer les autres fonction avant pour qu'on soit à la bonne étape puis aller chercher la variable
    await this.VotingInstance.startProposalsSession();
    let statusBefore = await this.VotingInstance.workflowStatus();

    await this.VotingInstance.endProposalsSession();

    let statusAfter = await this.VotingInstance.workflowStatus();

    expect(statusBefore).to.be.a.bignumber.equal(
      await new BN(Voting.enums.WorkflowStatus.ProposalsRegistrationStarted)
    );
    expect(statusAfter).to.be.a.bignumber.equal(
      await new BN(Voting.enums.WorkflowStatus.ProposalsRegistrationEnded)
    );
  });

  it("Passe de l'état VotingSessionStarted à VotingSessionEnded", async function () {
    await this.VotingInstance.startProposalsSession();
    await this.VotingInstance.endProposalsSession();
    await this.VotingInstance.startVoteSession();

    let statusBefore = await this.VotingInstance.workflowStatus();

    await this.VotingInstance.endVoteSession();

    let statusAfter = await this.VotingInstance.workflowStatus();

    expect(statusBefore).to.be.a.bignumber.equal(
      await new BN(Voting.enums.WorkflowStatus.VotingSessionStarted)
    );
    expect(statusAfter).to.be.a.bignumber.equal(
      await new BN(Voting.enums.WorkflowStatus.VotingSessionEnded)
    );
  });

  it("Passe de l'état ProposalsRegistrationEnded à VotingSessionStarted", async function () {
    await this.VotingInstance.startProposalsSession();
    await this.VotingInstance.endProposalsSession();

    let statusBefore = await this.VotingInstance.workflowStatus();

    await this.VotingInstance.startVoteSession();

    let statusAfter = await this.VotingInstance.workflowStatus();

    expect(statusBefore).to.be.a.bignumber.equal(
      await new BN(Voting.enums.WorkflowStatus.ProposalsRegistrationEnded)
    );
    expect(statusAfter).to.be.a.bignumber.equal(
      await new BN(Voting.enums.WorkflowStatus.VotingSessionStarted)
    );
  });

  //----------------------------------------------------------------------------------------//

  it("Ajouté une addresse à la white list", async function () {
    await this.VotingInstance.addWhiteList(owner, {
      from: owner,
    });
    let data = await this.VotingInstance.VoterMap(owner);
    let status = await this.VotingInstance.workflowStatus();

    expect(data[0]).to.be.equal(true);
    expect(status).to.be.a.bignumber.equal(
      await new BN(Voting.enums.WorkflowStatus.RegisteringVoters)
    );
  });

  it("Ajoute un proposition", async function () {
    let status = await this.VotingInstance.workflowStatus();
    let propsalIdBefore = (await this.VotingInstance.ProposalMap(1))[1];

    await this.VotingInstance.addWhiteList(owner);
    await this.VotingInstance.startProposalsSession();
    await this.VotingInstance.sendProposal("Salut", { from: owner });

    let propsalIdAfter = (await this.VotingInstance.ProposalMap(1))[1];
    let propsalAfter = (await this.VotingInstance.ProposalMap(1))[0];

    expect(propsalAfter).to.be.equal("Salut");
    expect(propsalIdAfter).to.be.a.bignumber.equal(propsalIdBefore);
    expect(status).to.be.a.bignumber.equal(
      await new BN(Voting.enums.WorkflowStatus.RegisteringVoters)
    );
  });

  it("Retourne une proposition", async function () {
    await this.VotingInstance.addWhiteList(owner);
    await this.VotingInstance.startProposalsSession();
    await this.VotingInstance.sendProposal("Salut", { from: owner });

    let data = await this.VotingInstance.seeProposition(1);

    expect(data[0]).to.be.equal("Salut");
  });

  it("Envoie un nouveau vote", async function () {
    await this.VotingInstance.addWhiteList(owner);
    await this.VotingInstance.startProposalsSession();
    await this.VotingInstance.sendProposal("Salut", { from: owner });
    await this.VotingInstance.endProposalsSession();
    await this.VotingInstance.startVoteSession();

    let proposalIdBefore = (await this.VotingInstance.VoterMap(owner))[2];
    let votedCountBefore = (await this.VotingInstance.ProposalMap(1))[1];
    let proposal = (await this.VotingInstance.ProposalMap(1))[0];
    await this.VotingInstance.sendVote(1, { from: owner });

    let hasVotedAfter = (await this.VotingInstance.VoterMap(owner))[1];
    let proposalIdAfter = (await this.VotingInstance.VoterMap(owner))[2];
    let votedCountAfter = (await this.VotingInstance.ProposalMap(1))[1];
    let winner = await this.VotingInstance.winner();

    expect(hasVotedAfter).to.be.equal(true);
    expect(votedCountAfter).to.be.bignumber.equal(
      votedCountBefore.add(new BN(1))
    );
    expect(proposalIdAfter).to.be.bignumber.equal(
      proposalIdBefore.add(new BN(1))
    );
    expect(winner).to.be.equal(proposal);
  });

  it("Retourne le nombre de vote d'une propostion", async function () {
    await this.VotingInstance.addWhiteList(owner);
    await this.VotingInstance.startProposalsSession();
    await this.VotingInstance.sendProposal("Salut", { from: owner });
    await this.VotingInstance.endProposalsSession();
    await this.VotingInstance.startVoteSession();
    await this.VotingInstance.sendVote(1, { from: owner });
    await this.VotingInstance.endVoteSession();

    let data = await this.VotingInstance.getStats(1, { from: owner });
    let votedCount = (await this.VotingInstance.ProposalMap(1))[1];

    expect(data).to.be.a.bignumber.equal(votedCount);
  });

  it("Choisi un gagnant", async function () {
    await this.VotingInstance.addWhiteList(owner);
    await this.VotingInstance.startProposalsSession();
    await this.VotingInstance.sendProposal("Salut", { from: owner });
    await this.VotingInstance.endProposalsSession();
    await this.VotingInstance.startVoteSession();
    await this.VotingInstance.sendVote(1, { from: owner });
    await this.VotingInstance.endVoteSession();
    let statusBefore = await this.VotingInstance.workflowStatus();

    await this.VotingInstance.setWinner(1);
    let statusAfter = await this.VotingInstance.workflowStatus();
    let winner = await this.VotingInstance.winner();
    let proposal = (await this.VotingInstance.ProposalMap(1))[0];

    expect(winner).to.be.a.bignumber.equal(proposal);
    expect(statusBefore).to.be.a.bignumber.equal(
      await new BN(Voting.enums.WorkflowStatus.VotingSessionEnded)
    );
    expect(statusAfter).to.be.a.bignumber.equal(
      await new BN(Voting.enums.WorkflowStatus.VotesTallied)
    );
  });

  it("Retourne le gagnant", async function () {
    await this.VotingInstance.addWhiteList(owner);
    await this.VotingInstance.startProposalsSession();
    await this.VotingInstance.sendProposal("Salut", { from: owner });
    await this.VotingInstance.endProposalsSession();
    await this.VotingInstance.startVoteSession();
    await this.VotingInstance.sendVote(1, { from: owner });
    await this.VotingInstance.endVoteSession();
    await this.VotingInstance.setWinner(1);

    let status = await this.VotingInstance.workflowStatus();

    expect(status).to.be.a.bignumber.equal(
      await new BN(Voting.enums.WorkflowStatus.VotesTallied)
    );
  });

  it("Retourne pour quoi a voter une addresse", async function () {
    await this.VotingInstance.addWhiteList(owner);
    await this.VotingInstance.startProposalsSession();
    await this.VotingInstance.sendProposal("Salut", { from: owner });
    await this.VotingInstance.endProposalsSession();
    await this.VotingInstance.startVoteSession();
    await this.VotingInstance.sendVote(1, { from: owner });

    let data = await this.VotingInstance.votedFor(owner);

    expect(data).to.be.a.bignumber.equal(new BN(1));
  });
});
