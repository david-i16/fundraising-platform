// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract CrowdFunding {
    struct Campaign {
        address owner;
        string title;
        string description;
        uint256 target;
        uint256 deadline;
        uint256 amountCollected;
        string image;
        address[] donators;
        uint256[] donations;
    }

    mapping(uint256 => Campaign) public campaigns;

    uint256 public numberOfCampaigns = 0;

    //_ is used for specifying that the param is only for the specified function in which is used as param
    //memory type = short-lived storage area that is used during contract execution; Memory variables are only valid for the duration of a function call and are deleted when the call ends.
    function createCampaign(address _owner, string memory _title, string memory _description, uint256 _target, uint256 _deadline, string memory _image) public returns (uint256) { //returns the id/index of the created campaign
        Campaign storage campaign = campaigns[numberOfCampaigns]; //each execution of the Smart contract has access to the data previously stored on the storage area

        //require statement = like a test, checks for some validation
        require(campaign.deadline < block.timestamp, "The deadline should be a date in the future!");

        campaign.owner = _owner;
        campaign.title = _title;
        campaign.description = _description;
        campaign.target = _target;
        campaign.deadline = _deadline;
        campaign.amountCollected = 0;
        campaign.image = _image;

        numberOfCampaigns++;


        return numberOfCampaigns - 1;
    }

    //payable = spcifies that we are going to send cryptocurrency through this function
    function donateToCampaign(uint256 _id) public payable {
        uint256 amount = msg.value;

        Campaign storage campaign = campaigns[_id];

        campaign.donators.push(msg.sender);
        campaign.donations.push(amount);

        (bool sent,) = payable(campaign.owner).call{value: amount}("");

        if(sent){
            campaign.amountCollected += amount;
        }
    }

    //view = return data to be able to view it
    function getDonators(uint256 _id) view public returns (address[] memory, uint256[] memory) {
        return(campaigns[_id].donators, campaigns[_id].donations);
    }

    function getCampaigns() view public returns (Campaign[] memory) {
        Campaign[] memory allCampaigns = new Campaign[](numberOfCampaigns);

        for(uint i = 0; i < numberOfCampaigns; i++){
            Campaign storage item  = campaigns[i];
            allCampaigns[i] = item;
        }

        return allCampaigns;
    }
}