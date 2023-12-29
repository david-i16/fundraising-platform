const CrowdFunding = artifacts.require("CrowdFunding");
const { expect } = require("chai"); // import expect interface from chai library

contract("CrowdFunding", (accounts) => {
    let crowdFunding;
    const owner = accounts[0];
    const donor = accounts[1];
    const target = web3.utils.toWei("1", "ether");
    const donation = web3.utils.toWei("0.1", "ether");

    beforeEach(async () => {
        crowdFunding = await CrowdFunding.new();
    });

    it("should allow creating a new campaign", async () => {
        const campaignId = await crowdFunding.createCampaign(owner, "Title", "Category", "Description", target, Date.now() + 86400, "image.jpg");
        
        // Retrieve the campaign to check if it was created correctly
        const campaign = await crowdFunding.campaigns(campaignId.toNumber());
        expect(campaign.owner).to.equal(owner);
        expect(campaign.title).to.equal("Title");
        expect(campaign.category).to.equal("Category");
        expect(campaign.target).to.equal(target);
    });

    it("should allow donations to a campaign", async () => {
        const campaignId = await crowdFunding.createCampaign(owner, "Title", "Category", "Description", target, Date.now() + 86400, "image.jpg");
        
        await crowdFunding.donateToCampaign(campaignId.toNumber(), { from: donor, value: donation });

        const campaign = await crowdFunding.campaigns(campaignId.toNumber());
        expect(campaign.amountCollected.toString()).to.equal(donation);
    });

    it("should not allow creating a campaign with a past deadline", async () => {
        try {
            await crowdFunding.createCampaign(owner, "Invalid", "Category", "Description", target, Date.now() - 86400, "image.jpg");
            assert.fail("Should have thrown an error");
        } catch (error) {
            expect(error.message).to.include("The deadline should be a date in the future!");
        }
    });

    it("should allow the owner to update the campaign before receiving donations", async () => {
        const campaignId = await crowdFunding.createCampaign(owner, "Title", "Category", "Description", target, Date.now() + 86400, "image.jpg");
        await crowdFunding.updateCampaign(campaignId.toNumber(), "New Title", "New Description", "new_image.jpg", Date.now() + 172800, { from: owner });

        const updatedCampaign = await crowdFunding.campaigns(campaignId.toNumber());
        expect(updatedCampaign.title).to.equal("New Title");
    });

    // ... (previous test cases)

    it("should allow the owner to adjust the campaign goal before receiving donations", async () => {
        const campaignId = await crowdFunding.createCampaign(owner, "Title", "Category", "Description", target, Date.now() + 86400, "image.jpg");
        const newTarget = web3.utils.toWei("2", "ether");

        await crowdFunding.adjustCampaignGoal(campaignId.toNumber(), newTarget, { from: owner });

        const campaign = await crowdFunding.campaigns(campaignId.toNumber());
        expect(campaign.target.toString()).to.equal(newTarget);
    });

    it("should not allow adjusting the campaign goal after receiving donations", async () => {
        const campaignId = await crowdFunding.createCampaign(owner, "Title", "Category", "Description", target, Date.now() + 86400, "image.jpg");

        await crowdFunding.donateToCampaign(campaignId.toNumber(), { from: donor, value: donation });

        try {
            const newTarget = web3.utils.toWei("2", "ether");
            await crowdFunding.adjustCampaignGoal(campaignId.toNumber(), newTarget, { from: owner });
            assert.fail("Should have thrown an error");
        } catch (error) {
            expect(error.message).to.include("Cannot adjust goal after receiving donations.");
        }
    });

    it("should allow refunding donators if the campaign doesn't meet its target", async () => {
        const campaignId = await crowdFunding.createCampaign(owner, "Title", "Category", "Description", target, Date.now() + 86400, "image.jpg");

        await crowdFunding.donateToCampaign(campaignId.toNumber(), { from: donor, value: donation });

        // Fast forward time to pass the deadline
        // require a testing framework that can manipulate blockchain time, such as Ganache

        await crowdFunding.refundDonators(campaignId.toNumber(), { from: owner });

        // Check if the funds were refunded properly
        // involving checking the balances of the donator accounts
    });

    it("should allow changing the campaign state", async () => {
        const campaignId = await crowdFunding.createCampaign(owner, "Title", "Category", "Description", target, Date.now() + 86400, "image.jpg");

        await crowdFunding.changeCampaignState(campaignId.toNumber(), "Paused", { from: owner });

        const campaign = await crowdFunding.campaigns(campaignId.toNumber());
        expect(campaign.CampaignState).to.equal("Paused");
    });

    

    it("should allow completing a campaign when the target is met", async () => {
        const campaignId = await crowdFunding.createCampaign(owner, "Title", "Category", "Description", target, Date.now() + 86400, "image.jpg");

        await crowdFunding.donateToCampaign(campaignId.toNumber(), { from: donor, value: target });

        await crowdFunding.completeCampaign(campaignId.toNumber(), { from: owner });

        const campaign = await crowdFunding.campaigns(campaignId.toNumber());
        expect(campaign.CampaignState).to.equal("Completed");
    });



    it("should not allow non-owners to update the campaign", async () => {
        const campaignId = await crowdFunding.createCampaign(owner, "Title", "Category", "Description", target, Date.now() + 86400, "image.jpg");

        try {
            await crowdFunding.updateCampaign(campaignId.toNumber(), "New Title", "New Description", "new_image.jpg", Date.now() + 172800, { from: donor });
            assert.fail("Should have thrown an error");
        } catch (error) {
            expect(error.message).to.include("Only the campaign owner can update it.");
        }
    });

    it("should not allow donations to a paused campaign", async () => {
        const campaignId = await crowdFunding.createCampaign(owner, "Title", "Category", "Description", target, Date.now() + 86400, "image.jpg");

        await crowdFunding.changeCampaignState(campaignId.toNumber(), "Paused", { from: owner });

        try {
            await crowdFunding.donateToCampaign(campaignId.toNumber(), { from: donor, value: donation });
            assert.fail("Should have thrown an error");
        } catch (error) {
            expect(error.message).to.include("Cannot donate to a paused campaign");
        }
    });

    it("should allow resuming a paused campaign", async () => {
        const campaignId = await crowdFunding.createCampaign(owner, "Title", "Category", "Description", target, Date.now() + 86400, "image.jpg");

        await crowdFunding.changeCampaignState(campaignId.toNumber(), "Paused", { from: owner });
        await crowdFunding.resumeCampaign(campaignId.toNumber(), { from: owner });

        const campaign = await crowdFunding.campaigns(campaignId.toNumber());
        expect(campaign.CampaignState).to.equal("Active");
    });

    it("should allow withdrawing funds after a campaign is completed", async () => {
        const campaignId = await crowdFunding.createCampaign(owner, "Title", "Category", "Description", target, Date.now() + 86400, "image.jpg");

        // Assuming the campaign is marked as completed
        await crowdFunding.withdrawFunds(campaignId.toNumber(), { from: owner });

        // Verify that the funds have been withdrawn
        // Involving checking the balance of the owner's account
    });

    
    it("should allow adding milestones to a campaign", async () => {
        const campaignId = await crowdFunding.createCampaign(owner, "Title", "Category", "Description", target, Date.now() + 86400, "image.jpg");

        const milestoneFundingLevel = web3.utils.toWei("0.5", "ether");
        await crowdFunding.addMilestone(campaignId.toNumber(), milestoneFundingLevel, "First Milestone", { from: owner });

        const milestones = await crowdFunding.campaignMilestones(campaignId.toNumber());
        expect(milestones[0].description).to.equal("First Milestone");
        expect(milestones[0].fundingLevel.toString()).to.equal(milestoneFundingLevel);
    });

    
});




    


