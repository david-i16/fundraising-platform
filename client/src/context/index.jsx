import React, { useContext, createContext } from 'react';
import { useAddress, useContract, useMetamask, useContractWrite } from '@thirdweb-dev/react';
import { ethers } from 'ethers';

const StateContext = createContext();

export const StateContextProvider = ({ children }) => {
    const { contract } = useContract("0x79218C87C966d1DfBC29EA60Eb22C4f3D0f9FcEe");
    const { mutateAsync: createCampaign } = useContractWrite(contract, "createCampaign");
    const address = useAddress();
    const connect = useMetamask();

    const publishCampaign = async (form) => {
        try {
            
            const data = await createCampaign({
				args: [
					address, // campaign owner
					form.title, 
					form.description, 
					form.target,
					new Date(form.deadline).getTime(), 
					form.image,
				]
			});

            console.log("contract call success", data)
            
        } catch (error) {
            console.log("contract call failure", error)
        }

    }

    return (
        <StateContext.Provider
            value={{
                address,
                contract,
                connect,
                createCampaign : publishCampaign,
            }}
        >
            {children}
        </StateContext.Provider>
    )

}

export const useStateContext = () => useContext(StateContext);