import Axios from "axios"
import { Button, Avatar } from "@mui/material";
import React, { useState, useEffect } from 'react';
import algosdk from 'algosdk';
import BlockchainPull from "./services/blockchainpull";
import LazyImage from './lazyimage';


const ShuffleFinder = ({myAlgoConnect, accountChange, setAccountChange}) => {
    const [shuffles, setShuffles] = useState([]);
    const [displayShuffles, setDisplayShuffles] = useState([]); 
    const baseServer = 'https://mainnet-algorand.api.purestake.io/ps2';
    const testServer = "https://testnet-algorand.api.purestake.io/ps2";
    const port = '';
    const token = {
    'X-API-Key': 'BFzlkNCYOkxXwEtQXnGl6X7u2iwmyYd146i92hHb'
    }
    let block =  new BlockchainPull()
    let account = localStorage.getItem("accountid")
    const algodClient = new algosdk.Algodv2(token, testServer, port);
    
    useEffect(() => {
        Axios.get("http://localhost:80/findinstantshuffles")
        .then(result => {
            console.log(result.data)
            setShuffles(result.data)
        })
        .catch(err => {
        console.log(`Something bad happened while fetching the data\n${err}`)
        })
        
      }, []);

    const shuffleHover = (shuffle) =>{
        console.log("hover")
        console.log(shuffle)
    }

    const shuffleUnhover = () =>{
        console.log("unhover")
    }

    const enterShuffle = async (shuffle) =>{

        let accountIndex = await block.algoGetAccount(shuffle.storeAddress)
        let storeWallet = accountIndex.data.account
        let storeAssets = storeWallet.assets.filter(asset => asset.amount > 0)
        console.log(storeAssets)
        let params = await algodClient.getTransactionParams().do();
        let sender = account;
        let recipient = account;
        let revocationTarget = undefined;
        let closeRemainderTo = undefined;
        const enc = new TextEncoder();
        const note = enc.encode("Hello World");
        let amount = 0;
        //opt into all assets
        let txnarr =[]
        let submitTxnArr=[]
        const receiver = shuffle.storeAddress;
        let price = shuffle.price; 
        let royaltyPrice = shuffle.price * 0.10
        let lankz = "LANKZYW5QDFPDB4RYI3BH7MMCAYKOZUAFIE4VNDSKKTY26YCCSSRFRTYAA"
        let txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
            from: sender, 
            to: receiver, 
            amount: price - royaltyPrice, 
            node: note, 
            suggestedParams: params
        });
        let royaltytxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
            from: sender, 
            to: lankz, 
            amount: price * 0.10, 
            node: note, 
            suggestedParams: params
        });
        submitTxnArr.push(txn)
        submitTxnArr.push(royaltytxn)
        let noteOpt = enc.encode("Opt in");
        const randomElement = storeAssets[Math.floor(Math.random() * storeAssets.length)];
        console.log(randomElement)
        for(let asset of storeAssets) {
        let opttxn = algosdk.makeAssetTransferTxnWithSuggestedParams(sender, recipient, closeRemainderTo, revocationTarget,
            amount, noteOpt, asset['asset-id'], params);
            txnarr.push(opttxn)
            if(asset['asset-id'] === randomElement['asset-id']){
                submitTxnArr.push(opttxn)
            }
        }

        //this code needs to go to backend
        sender = shuffle.storeAddress
        recipient = account
        amount = 1;
        let noteFlag = enc.encode("Asset Transfer");
    
        let xtxn = algosdk.makeAssetTransferTxnWithSuggestedParams(sender, recipient, closeRemainderTo, revocationTarget,
            amount,  noteFlag, randomElement['asset-id'] ,params);

        submitTxnArr.push(xtxn)

        let obj ={
            address : shuffle.sellerAddress
          }
        let wallet = await Axios.post("http://localhost:80/findwallet", obj)
        
        let txnArrInBytes = []
        //find index of randomly selected asset
        let selectedIndex = txnarr.findIndex(tranny => tranny.assetIndex === randomElement['asset-id']) + 2
        let txgroup = algosdk.assignGroupID(submitTxnArr);
        let group = submitTxnArr[0].group
        for(let transaction of submitTxnArr){
            let buff = new Buffer.from(transaction.note, 'base64');
            let transferNote = buff.toString('ascii');
            if(transferNote !== "Asset Transfer" && transferNote !== 'Opt in'){
                txnArrInBytes.push(transaction.toByte());
            }
        }
        for(let transaction of txnarr){ 
            transaction.group = group
            if(transaction.assetindex === randomElement['asset-id']){
                txnArrInBytes.push(submitTxnArr[2].toByte())
            } 
             txnArrInBytes.push(transaction.toByte());
        }
        const signedTxn = await myAlgoConnect.signTransaction(txnArrInBytes);
    
        let signedTxns = []
        signedTxns.push(signedTxn[0].blob);
        signedTxns.push(signedTxn[1].blob);
        signedTxns.push(signedTxn[selectedIndex].blob);
        let privateSig = new Uint8Array(Buffer.from(wallet.data.storePK,'base64'));
        let rawSignedTxn = xtxn.signTxn(privateSig);
        signedTxns.push(rawSignedTxn);
        let tx = (await algodClient.sendRawTransaction(signedTxns).do());
        let confirmedTxn = await algosdk.waitForConfirmation(algodClient, tx.txId, 4);
        //make sure waitrounds is good
        //retry if it is already selected
        console.log("Transaction : " + tx.txId);

    }

    Storage.prototype.setObj = function(key, obj) {
        return this.setItem(key, JSON.stringify(obj))
    }
    Storage.prototype.getObj = function(key) {
        return JSON.parse(this.getItem(key))
    }


    return(
        <div>   
            {shuffles.map(function(shuffle, i){
            return <div key={i} ><p>{shuffle.storeAddress}</p>
            {shuffle.image ? <LazyImage nft={undefined} src={shuffle.image} small={false} shuffle={shuffle}></LazyImage> :
            <div></div>
            }
            <Button
            onClick={() => enterShuffle(shuffle)}
            variant="contained"
            color="primary"
            startIcon={<Avatar src={"algo.png"} />}
            >
            
            Enter Shuffle
            <br></br>
            Price:
            {shuffle.price / 1000000}
            A
            </Button>
            <br></br> </div>;
            })}
        </div>
    )
}




export default ShuffleFinder;