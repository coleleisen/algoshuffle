import Axios from "axios"
import { Button, Avatar } from "@mui/material";
import React, { useState, useEffect } from 'react';
import algosdk from 'algosdk';
import BlockchainPull from "./services/blockchainpull";
import LazyImage from './lazyimage';


const ShuffleFinder = ({myAlgoConnect, accountChange, setAccountChange, backend, triggerError}) => {
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

    function base64ToArrayBuffer(base64) {
        var binary_string = window.atob(base64);
        var len = binary_string.length;
        var bytes = new Uint8Array(len);
        for (var i = 0; i < len; i++) {
            bytes[i] = binary_string.charCodeAt(i);
        }
        return bytes;
    }


    
    useEffect(() => {
        Axios.get(`${backend}/findinstantshuffles`)
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
        let params = await algodClient.getTransactionParams().do();
        let storeWallet = accountIndex.data.account
        let storeAssets = storeWallet.assets.filter(asset => asset.amount > 0)
        console.log(storeAssets)

        let tranObj={
            address : account,
            storeAssets : storeAssets,
            shuffle : shuffle,
            params : params,
            token : localStorage.getItem('apiKey')
        }
        let res = await Axios.post(`${backend}/instantshuffletransaction`, tranObj);
        if(res.data.status==="fail"){
            triggerError(res.data.message)
        }
        let tranResponse = res.data
        
       console.log(tranResponse.signArray)
       
       let arr = []
       for(let tran of tranResponse.signArray){
           console.log(tran)
           let uintArray = base64ToArrayBuffer(tran)
           console.log(uintArray)
           arr.push(uintArray)
       }
       console.log(arr)
       let signedTxn
       try{
           signedTxn = await myAlgoConnect.signTransaction(arr);
        }catch(e){
          console.log(e)
          triggerError(e.toString())
          return;
        }
        let signedTxns = []
        let selectedIndex = tranResponse.selectedIndex
        signedTxns.push(signedTxn[0].blob);
        signedTxns.push(signedTxn[1].blob);
        signedTxns.push(signedTxn[selectedIndex+2].blob);
        let rawTxn = base64ToArrayBuffer(tranResponse.rawSignedTxn)
        signedTxns.push(rawTxn);
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
            
            Buy One
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