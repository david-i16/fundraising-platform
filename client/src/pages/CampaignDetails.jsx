import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { useStateContext } from '../context';
import { CustomButton, CountBox, Loader } from '../components';
import { calculateBarPercentage, daysLeft } from '../utils';
import { thirdweb } from '../assets';

const CampaignDetails = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { donate, getDonations, contract, address } = useStateContext();

  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [donators, setDonators] = useState([]);

  const remainingDays = daysLeft(state.deadline);

  const fetchDonators = async () => {
    const data = await getDonations(state.pId);
    setDonators(data);
  }

  useEffect(() => {
    if(contract) fetchDonators();
  }, [contract, address])

  const handleDonate = async () => {
    setIsLoading(true);
    await donate(state.pId, amount);
    navigate('/')
    setIsLoading(false);
  }

  return (
    <div>
      {isLoading && <Loader />}

      <div className="mt-[80px]">
        <p className="font-epilogue font-bold text-[25px] text-black leading-[26px] text-justify uppercase">{ state.title }</p>
      </div>
      <div className="w-full flex md:flex-row flex-col mt-10 gap-[30px]">
        <div className="flex-1 flex-col">
          <img src={state.image} alt="campaign" className="w-full h-[500px] object-cover rounded-xl"/>
          <div className="relative w-full h-[10px] bg-[#3a3a43] mt-2 rounded-xl">
            <div className="absolute h-full bg-[#f70202] rounded-xl" style={{ width: `${calculateBarPercentage(state.target, state.amountCollected)}%`, maxWidth:'100%'}}>

            </div>
          </div>
        </div>
        <div className="flex md:w-[150px] w-full flex-wrap justify-between gap-[30px]">
          <CountBox title="Days Left" value={remainingDays} />
          <CountBox title={`Raised of ${state.target} ETH`} value={state.amountCollected} />
          <CountBox title="Total Backers" value={donators.length} />
        </div>
      </div>

      <div className="mt-[20px] flex flex-col gap-4">
        <div className="flex justify-between items-center gap-4">
          <p className="font-epilogue font-semibold text-[25px] text-black leading-[26px] text-justify uppercase">{ `${calculateBarPercentage(state.target, state.amountCollected)}%` }</p>
          <div className="mr-[180px]">
          <p className="font-epilogue font-normal text-[19px] text-black leading-[26px] text-justify">{ `${state.amountCollected * 2300}$ collected of ${state.target * 2300}$ target` }</p>
          </div>
        </div>
      </div>

      <div className="mt-[60px] flex lg:flex-row flex-col gap-5">
        <div className="flex-[2] flex flex-col gap-[40px]">
          
          <div>
            <h4 className="font-epilogue font-semibold text-[18px] text-black uppercase">Creator</h4>
            <div className="mt-[20px] flex flex-row items-center flex-wrap gap-[14px]">
              <div className="w-[52px] h-[52px] flex items-center justify-center rounded-full bg-[#2c2f32] cursor-pointer">
                <img src={thirdweb} alt="user" className="w-[60%] h-[60%] object-contain"/>
              </div>
            <div>
                <h4 className="font-epilogue font-semibold text-[14px] text-black break-all">{ state.owner }</h4>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-epilogue font-semibold text-[18px] text-black uppercase">Category</h4>
            <div className="mt-[20px]">
              <p className="font-epilogue font-normal text-[16px] text-black leading-[26px] text-justify uppercase">{ state.category }</p>
            </div>
          </div>

          <div>
            <h4 className="font-epilogue font-semibold text-[18px] text-black uppercase">Story</h4>
            <div className="mt-[20px]">
              <p className="font-epilogue font-normal text-[16px] text-black leading-[26px] text-justify">{ state.description }</p>
            </div>
          </div>

          <div>
            <h4 className="font-epilogue font-semibold text-[18px] text-black uppercase">Donators</h4>
            <div className="mt-[20px] flex flex-col gap-4">
              {donators.length > 0 ? donators.map((item,index) => (
                <div key={`${item.donator}-${index}`} className="flex justify-between items-center gap-4">
                  <p className="font-epilogue font-normal text-[16px] text-black leading-[26px] break-all">{index + 1}.  {item.donator}</p>
                  <p className="font-epilogue font-normal text-[16px] text-black leading-[26px] break-all">{item.donation} ETH</p>
                </div>
              )) : (
                <p className="font-epilogue font-normal text-[16px] text-[#808191] leading-[26px] text-justify">No donators yet. Be the first one!</p>
              )}
            </div>
          </div>
          
          <div className="flex-1">
            <h4 className="font-epilogue font-semibold text-[18px] text-black uppercase">Fund</h4>
            <div className="mt-[20px] flex flex-col p-4 bg-[#1c1c24] rounded-[10px]">
              <p className="font-epilogue font-medium text-[20px] leading-[30px] text-center text-[#808191]">Fund the campaign</p>
              <div className="mt-[30px]">
                <input 
                  type="number"
                  placeholder="ETH 0.1"
                  step="0.01"
                  className="w-full py-[10px] sm:px-[20px] px-[15px] outline-none border-[1px] border-[#3a3a43] bg-transparent font-epilogue text-white text-[18px] leading-[30px] placeholder:text-[#4b5264] rounded-[10px]"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <div className="my-[20px] p-4 bg-[#13131a] rounded-[10px]">
                  <h4 className="font-epilogue font-semibold text-[14px] leading-[22px] text-white">Back it beacuse you believe in it</h4>
                  <p className="mt-[20px] font-epilogue font-normal leading-[22px] text-[#808191]">Support the project for possible rewards after the funding has ended</p>
                </div>

                <CustomButton 
                  btnType="button"
                  title="Fund Campaign"
                  styles="w-full text-black bg-[#FFCB9A]"
                  handleClick={handleDonate}
                />

              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  )
}

export default CampaignDetails