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
    const [transactions, setTransactions] = React.useState([]);
    const handleChange = (e, name) => {
        setFormData((prevState) => ({...prevState, [name]: e.target.value}));
    }

    const getAllTransactions = async () => {
        try {
            if(!ethereum) return alert('Please connect to MetaMask');

            const transactionContract = getEthereumContract();
            const availableTransactions = await transactionContract.getAllTransactions();
            const structuredTransaction = availableTransactions.map((transaction) => ({
                addressTo: transaction.receiver,
                addressFrom: transaction.sender,
                message: transaction.message,
                timestamp: new Date(transaction.timestamp.toNumber() * 1000).toLocaleString(),
                keyword: transaction.keyword,
                amount: parseInt(transaction.amount._hex) / (10 ** 18),
            }));
            setTransactions(structuredTransaction);
            console.log('availableTransactions', structuredTransaction);
        } catch (error) {
            console.log('Error in AllTransaction')
        }
    }

    const checkIfWalletIsConnected = async () => {

        try {
            if(!ethereum) return alert('Please install Metamask');

            const accounts = await ethereum.request({ method: 'eth_accounts' });

            if(accounts.length){
                setCurrentAccount(accounts[0]);
                getAllTransactions();
            } else {
                console.log('no accounts found')
            }
            console.log('accounts', accounts);

        } catch (error) {
            console.log('No Ethereum Object');
        }
    }

    const checkIfTransctionExist = async () => {
        try {
            const transactionContract = getEthereumContract();

            const transactionCount = await transactionContract.transactionCount();
            setTransactionCount(transactionCount);
            localStorage.setItem('transactionCount', transactionCount);
        } catch (error) {
            console.log('Error');
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
        checkIfTransctionExist();
    }, []);

    return (
        <TransactionContext.Provider value={{ connectWallet, transactions, currentAccount, formData, setFormData, handleChange, sendTransaction, isLoading }}>
            {children}
        </TransactionContext.Provider>
    )
}