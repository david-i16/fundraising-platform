// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract CrowdFunding {
    struct Campaign {
        address owner;
        string title;
        string category;
        string description;
        uint256 target;
        uint256 deadline;
        uint256 amountCollected;
        string image;
        address[] donators;
        uint256[] donations;
        string CampaignState;
    }

    mapping(uint256 => Campaign) public campaigns;
    mapping(uint256 => uint256) public escrowedFunds;

    uint256 public numberOfCampaigns = 0;

    //_ is used for specifying that the param is only for the specified function in which is used as param
    //memory type = short-lived storage area that is used during contract execution; Memory variables are only valid for the duration of a function call and are deleted when the call ends.
    function createCampaign(address _owner, string memory _title, string memory _category, string memory _description, uint256 _target, uint256 _deadline, string memory _image) public returns (uint256) { //returns the id/index of the created campaign
        Campaign storage campaign = campaigns[numberOfCampaigns]; //each execution of the Smart contract has access to the data previously stored on the storage area

        //require statement = like a test, checks for some validation
        require(campaign.deadline < block.timestamp, "The deadline should be a date in the future!");

        campaign.owner = _owner;
        campaign.title = _title;
        campaign.category = _category;
        campaign.description = _description;
        campaign.target = _target;
        campaign.deadline = _deadline;
        campaign.amountCollected = 0;
        campaign.image = _image;

        numberOfCampaigns++;


        return numberOfCampaigns - 1;
    }


    //owner can update current campaign params
    function updateCampaign(uint256 _id, string memory _newTitle, string memory _newDescription, string memory _newImage, uint256 _newDeadline) public {
        Campaign storage campaign = campaigns[_id];
        require(msg.sender == campaign.owner, "Only the campaign owner can update it.");
        require(campaign.amountCollected == 0, "Cannot update campaign after receiving donations.");
        require(_newDeadline > campaign.deadline, "New deadline must be later than the current one.");
        campaign.title = _newTitle;
        campaign.description = _newDescription;
        campaign.image = _newImage;
        campaign.deadline = _newDeadline;
    }


    //goal amount adjustment under certain circumstances
    function adjustCampaignGoal(uint256 _id, uint256 _newTarget) public {
        Campaign storage campaign = campaigns[_id];
        require(msg.sender == campaign.owner, "Only the campaign owner can adjust the goal.");
        require(campaign.amountCollected == 0, "Cannot adjust goal after receiving donations.");
        require(_newTarget > 0, "Campaign target must be greater than 0.");
        campaign.target = _newTarget;
    }



    //payable = spcifies that we are going to send cryptocurrency through this function
    function donateToCampaign(uint256 _id) public payable {
        uint256 amount = msg.value;
         escrowedFunds[_id] += msg.value;

        Campaign storage campaign = campaigns[_id];

        campaign.donators.push(msg.sender);
        campaign.donations.push(amount);

        (bool sent,) = payable(campaign.owner).call{value: amount}("");

        if(sent){
            campaign.amountCollected += amount;
        }
    }


    //escrow mechanism to hold funds until the campaign is successfully completed (very useful security feature)
    function releaseFunds(uint256 _id) public {
        Campaign storage campaign = campaigns[_id];
        require(msg.sender == campaign.owner, "Only the campaign owner can release funds.");
        require(keccak256(abi.encodePacked(campaign.CampaignState)) == keccak256(abi.encodePacked("Completed")), "Funds can only be released for completed campaigns.");
        uint256 amount = escrowedFunds[_id];
        escrowedFunds[_id] = 0;
        payable(campaign.owner).transfer(amount);
    }




    //refund the donations if the campaign doesn't meet its target by the deadline or if the campaign is canceled 
    function refundDonators(uint256 _id) public {
        Campaign storage campaign = campaigns[_id];
        require(msg.sender == campaign.owner, "Only the campaign owner can refund donations.");
        require(block.timestamp > campaign.deadline, "Can refund only after the deadline.");
        require(campaign.amountCollected < campaign.target, "Cannot refund if target is met.");

        for (uint i = 0; i < campaign.donators.length; i++) {
            payable(campaign.donators[i]).transfer(campaign.donations[i]);
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

    //gradually changing campaign state
    //integrated in other func with some conditions
    function changeCampaignState(uint256 _id, string memory _newState) public {
        Campaign storage campaign = campaigns[_id];
        require(msg.sender == campaign.owner, "Only the campaign owner can change the state.");
        campaign.CampaignState = _newState;
    }


    //if the goal amount is reached before the deadline
    function completeCampaign(uint256 _id) public {
        Campaign storage campaign = campaigns[_id];
        require(msg.sender == campaign.owner, "Only the campaign owner can complete the campaign.");
        require(campaign.amountCollected >= campaign.target, "Campaign target not met yet.");
        campaign.CampaignState = "Completed";
    }



    //campaign owners can temporarily pause and later resume their campaigns
    function pauseCampaign(uint256 _id) public {
        Campaign storage campaign = campaigns[_id];
        require(msg.sender == campaign.owner, "Only the campaign owner can pause the campaign.");
        require(keccak256(abi.encodePacked(campaign.CampaignState)) == keccak256(abi.encodePacked("Active")), "Can only pause active campaigns.");
        campaign.CampaignState = "Paused";
    }

    function resumeCampaign(uint256 _id) public {
        Campaign storage campaign = campaigns[_id];
        require(msg.sender == campaign.owner, "Only the campaign owner can resume the campaign.");
        require(keccak256(abi.encodePacked(campaign.CampaignState)) == keccak256(abi.encodePacked("Paused")), "Can only resume paused campaigns.");
        campaign.CampaignState = "Active";
    }




    //in case we will implement a safety feature for transfers with escrow account, might need to be able to let campaign owner to withdraw the funds when campaign reached deadline
    function withdrawFunds(uint256 _id) public {
        Campaign storage campaign = campaigns[_id];
        require(msg.sender == campaign.owner, "Only the campaign owner can withdraw funds.");
        require(keccak256(abi.encodePacked(campaign.CampaignState)) == keccak256(abi.encodePacked("Completed")), "Can only withdraw from completed campaigns.");
    
        uint256 amount = campaign.amountCollected;
        campaign.amountCollected = 0;
        payable(msg.sender).transfer(amount);
    }


    
    //future update: milestones for campaigns, unlocking funds or triggering events when certain funding levels are reached

    struct Milestone {
        uint256 fundingLevel;
        string description;
        bool achieved;
    }

    mapping(uint256 => Milestone[]) public campaignMilestones;

    function addMilestone(uint256 _id, uint256 _fundingLevel, string memory _description) public {
        Campaign storage campaign = campaigns[_id];
        require(msg.sender == campaign.owner, "Only the campaign owner can add milestones.");
        Milestone memory newMilestone = Milestone({
            fundingLevel: _fundingLevel,
            description: _description,
            achieved: false
        });
        campaignMilestones[_id].push(newMilestone);
    }


}