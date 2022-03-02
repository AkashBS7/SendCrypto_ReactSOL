import React, {useEffect, usestate} from "react";
import {ethers} from "ethers";

import {contractABI, contractAddress} from "../utils/contants";

export const TransactionContext = React.createContext();

const { ethereum } = window;

const getEthereumContract = () => {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const transactionContract = new ethers.Contract(contractAddress, contractABI, signer);

    return transactionContract;
}


export const TransactionProvider = ({children}) => {

    const [currentAccount, setCurrentAccount] = React.useState('');
    const [formData, setFormData] = React.useState({addressTo: '', amount: '', keyword: '', message: ''});
    const [isLoading, setIsLoading] = React.useState(false);
    const [transactionCount, setTransactionCount] = React.useState(localStorage.getItem('transactionCount'));

    const handleChange = (e, name) => {
        setFormData((prevState) => ({...prevState, [name]: e.target.value}));
    }

    const checkIfWalletIsConnected = async () => {

        try {
            if(!ethereum) return alert('Please install Metamask');

            const accounts = await ethereum.request({ method: 'eth_accounts' });

            if(accounts.length){
                setCurrentAccount(accounts[0]);
            } else {
                console.log('no accounts found')
            }
            console.log('accounts', accounts);

        } catch (error) {
            console.log('No Ethereum Object');
        }
        
    }

    const connectWallet = async () => {
        try {
            if(!ethereum) return alert('Please install Metamask');
            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
            setCurrentAccount(accounts[0]);
        } catch (error) {
            console.log('error', error);
        }
    }

    const sendTransaction  = async () => {
        try {
            if(!ethereum) return alert('Please install Metamask');

            const {addressTo, amount, keyword, message} = formData;
            const transactionContract =  getEthereumContract();

            const parsedAmount = ethers.utils.parseEther(amount);

            await ethereum.request({ 
                method: 'eth_sendTransaction',
                params: [{
                    from : currentAccount,
                    to: addressTo,
                    gas : '0x5208',
                    value: parsedAmount._hex,
                }]
            });

            const transactionHash = await  transactionContract.addToBlockChain(addressTo, parsedAmount, message, keyword);
            setIsLoading(true);
            console.log(`lodaing ${transactionHash.hash}`);
            await transactionHash.wait();
            setIsLoading(false);
            console.log(`Success`);

            const transactionCount = await transactionContract.getTransactionCount();
            setTransactionCount(transactionCount.toNumber());

           
        }  catch (error) {
            console.log('No Ethereum Object');
        }
    }

    useEffect(() => {
        checkIfWalletIsConnected();
    }, []);

    return (
        <TransactionContext.Provider value={{ connectWallet, currentAccount, formData, setFormData, handleChange, sendTransaction }}>
            {children}
        </TransactionContext.Provider>
    )
}