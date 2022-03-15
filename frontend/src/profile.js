import React, { useState, useEffect } from 'react'
import {
  BrowserRouter,
  Routes,
  Route,
  useParams
} from "react-router-dom";
import './App.css';
import WalletConnect from './walletconnect';
import Axios from "axios"
import NftFinder from './nftfinder';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import styled from 'styled-components';
import MenuIcon from '@mui/icons-material/Menu';
import Box from '@mui/material/Box';
import algosdk from 'algosdk';
import Modal from '@mui/material/Modal';
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import Input from '@mui/material/Input';
import { Tooltip, Grid } from '@mui/material';
import BlockchainPull from './services/blockchainpull';
import LazyImage from './lazyimage';




const style = {
   
  };

  

  const BigGrid = styled.section`
display: grid;
grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
row-gap: 1rem;
column-gap: 1rem;
padding: 1rem;
justify-items: center;
`;
const SmallGrid = styled.section`
display: grid;
grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
row-gap: 1rem;
column-gap: 1rem;
padding: 1rem;
justify-items: center;
`;

function Profile({myAlgoConnect, setAccountChange}) {
const [open, setOpen] = React.useState(false);
const [open2, setOpen2] = React.useState(false);
const [editProfile, setEditProfile] = React.useState(false);
const [needStore, setNeedStore] = React.useState(false);
const [changeShuffleAvatar, setChangeShuffleAvatar] = React.useState(false);
const [ownedNfts, setOwnedNfts] = React.useState([]);
const [loopDone, setLoopDone] = React.useState([]);
const [createdNfts, setCreatedNfts] = React.useState([]);
const [selectedForShuffle, setSelectedForShuffle] = React.useState([]);
const [shuffleImage, setShuffleImage] = React.useState("");
const [shufflePrice, setShufflePrice] = React.useState(0);
const [profileName, setProfileName] = React.useState("");
const [profile, setProfile] = React.useState();
const [avatar, setAvatar] = React.useState("");
const [profileIndex, setProfileIndex] = React.useState();
const [website, setWebsite] = React.useState("");
const [bio, setBio] = React.useState("");
const [profileHovered, setProfileHovered] = React.useState(false);
const handleOpen = () => setOpen(true);
const handleOpen2 = () => setOpen2(true);
const handleClose = () => setOpen(false);
const handleClose2 = () => setOpen2(false);

let params = useParams();
const block = new BlockchainPull()
const baseServer = 'https://mainnet-algorand.api.purestake.io/ps2';
const testServer = "https://testnet-algorand.api.purestake.io/ps2";
let gateway = "https://gateway.pinata.cloud/ipfs/"
const placeHolder ='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkqAcAAIUAgUW0RjgAAAAASUVORK5CYII='
const port = '';

const token = {
   'X-API-Key': 'BFzlkNCYOkxXwEtQXnGl6X7u2iwmyYd146i92hHb'
}

//const algodClient = new algosdk.Algodv2('', 'https://api.algoexplorer.io/', '');
const algodClient = new algosdk.Algodv2(token, testServer, port);
let account = localStorage.getItem("accountid")


// Function used to wait for a tx confirmation
const waitForConfirmation = async function (algodclient, txId) {
  let response = await algodclient.status().do();
  let lastround = response["last-round"];
  while (true) {
      const pendingInfo = await algodclient.pendingTransactionInformation(txId).do();
      if (pendingInfo["confirmed-round"] !== null && pendingInfo["confirmed-round"] > 0) {
          //Got the completed Transaction
          console.log("Transaction " + txId + " confirmed in round " + pendingInfo["confirmed-round"]);
          break;
      }
      lastround++;
      await algodclient.statusAfterBlock(lastround).do();
  }
};

const shuffleImageChange = () =>{
  if(changeShuffleAvatar){
    setChangeShuffleAvatar(false)
  }else{
    setChangeShuffleAvatar(true)
  }
}

const changeProfileName = (e) =>{
    setProfileName(e.target.value)
}

const changeWebsite = (e) =>{
    setWebsite(e.target.value)
}
const changeShufflePrice = (e) =>{
  setShufflePrice(e.target.value)
}

const changeBio = (e) =>{
    setBio(e.target.value)
}

const handleEdit = () => {
  if(editProfile){
    setEditProfile(false)
  }else{
    setEditProfile(true);
    if(profile){
      setAvatar(profile.avatar)
      setProfileName(profile.profileName)
      setWebsite(profile.website)
      setBio(profile.bio)
    }
    
  }
}

const profileHover = () =>{
  setProfileHovered(true)
}

const profileHoverLeave = () =>{
  setProfileHovered(false)
}

const editAvatar = () =>{
  handleOpen()
}

const chooseAvatar = (url) =>{
  setAvatar(url)
  setOpen(false)
}

const selectShuffle = ()=>{
  handleOpen2()
}

const generateStore = ()=>{
  let body = {
    address : account
  }
  Axios.post("http://localhost:80/savewallet", body) 
  .then(wallet => {
    setNeedStore(false)
  })
  .catch(err => {
  console.log("====================================")
  console.log(`Something bad happened while fetching the data\n${err}`)
  console.log("====================================")
  })
  
}

const selectShuffleNft = (nft)=>{
    console.log(nft)
    if(selectedForShuffle.length === 0 || changeShuffleAvatar){
      setShuffleImage(nft.params.url)
      setChangeShuffleAvatar(false)
    }
    let arr = JSON.parse(JSON.stringify(selectedForShuffle))
    if(selectedForShuffle.some(sel => sel.index === nft.index)){
        arr = arr.filter(sel => sel.index !== nft.index)
    }else{
      arr.push(nft)
    }
    setSelectedForShuffle(arr)
}



const shuffleNfts = async () =>{
  if(shufflePrice < 1 || shufflePrice === undefined){
    console.log("must set price")
    return
  }
  if(selectedForShuffle.length < 1){
    console.log("must select asset for shuffle")
    return
  }
  setOpen2(false)
  let obj ={
    address : account,
    selectedForShuffle : selectedForShuffle
  }
  let params = await algodClient.getTransactionParams().do();
  let wallet = await Axios.post("http://localhost:80/findwallet", obj)
  let accountInfo = await algodClient.accountInformation(wallet.data.storeAddress).do();
  console.log(accountInfo);
  let nonSpendable = accountInfo.assets.length * 100000;
  let requiredAmount = selectedForShuffle.length * 102000 + 100000;
  console.log(requiredAmount);
  if(accountInfo.amount - nonSpendable < requiredAmount){
    let amountOwed = requiredAmount - (accountInfo.amount - nonSpendable)

     const receiver = wallet.data.storeAddress;
     const enc = new TextEncoder();
     const note = enc.encode("Hello World");
     let amount = amountOwed; 
     let sender = account;

     let txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
         from: sender, 
         to: receiver, 
         amount: amount, 
         node: note, 
         suggestedParams: params
     });
     console.log(txn)
     const signedTxn = await myAlgoConnect.signTransaction(txn.toByte());
     const response = await algodClient.sendRawTransaction(signedTxn.blob).do();
     console.log(response)
     await waitForConfirmation(algodClient, response.txId);

  }else{
    let sender = wallet.data.storeAddress;
    let recipient = wallet.data.storeAddress;
    let revocationTarget = undefined;
    let closeRemainderTo = undefined;
    const enc = new TextEncoder();
    const note = enc.encode("Hello World");
    let amount = 0;
    //opt into all assets
    for(let asset of selectedForShuffle) {
      let opttxn = algosdk.makeAssetTransferTxnWithSuggestedParams(sender, recipient, closeRemainderTo, revocationTarget,
        amount, note, asset.index, params);
        let arr = new Uint8Array(Buffer.from(wallet.data.storePK,'base64')); 
        let rawSignedTxn = opttxn.signTxn(arr);
        let opttx = (await algodClient.sendRawTransaction(rawSignedTxn).do());
        await waitForConfirmation(algodClient, opttx.txId);
        console.log("Transaction : " + opttx.txId);
    }
    //send over all assets
    
    sender = wallet.data.sellerAddress
    recipient = wallet.data.storeAddress
    amount = 1;
    let txnArr = []
    for(let asset of selectedForShuffle) {
      let xtxn = algosdk.makeAssetTransferTxnWithSuggestedParams(sender, recipient, closeRemainderTo, revocationTarget,
        amount,  note, asset.index, params);
        txnArr.push(xtxn.toByte())
    }
    const signedTxn = await myAlgoConnect.signTransaction(txnArr);

    for(let tran of signedTxn) {
    const response = await algodClient.sendRawTransaction(tran.blob).do();
    await waitForConfirmation(algodClient, response.txId);
    console.log(response)
    }
    let body={
      address : account,
      price : 1000000 * shufflePrice,
      image : shuffleImage
    }
    if(shufflePrice > 0){
      let shuffle = await Axios.post("http://localhost:80/saveinstantshuffle", body)  
      console.log(shuffle)
    }
    
  }

}

const saveProfile = () =>{
    setEditProfile(false)
    //account = "LANKZYW5QDFPDB4RYI3BH7MMCAYKOZUAFIE4VNDSKKTY26YCCSSRFRTYAA"
    console.log(account)
    var enc = new TextEncoder(); // always utf-8
    let obj = {
        profileName : profileName,
        website : website,
        bio : bio,
        avatar : avatar
    }
    let parameters ={
        note : enc.encode(JSON.stringify(obj)),
        addr : account,
        sender : account,
        recipient : account,
        revocationTarget : undefined,
        closeRemainderTo: undefined,
        amount : 0,
        assetID : 588884179
   }

    signTransaction(parameters)
    
}
async function signTransaction (p) {
    try {
        let param = await algodClient.getTransactionParams().do();
        console.log(param)
        console.log(p)
        let txn = algosdk.makeAssetTransferTxnWithSuggestedParams(p.sender, p.recipient, p.closeRemainderTo, p.revocationTarget,
          p.amount, p.note, p.assetID, param);
        console.log(txn)
        const signedTxn = await myAlgoConnect.signTransaction(txn.toByte());
        const response = await algodClient.sendRawTransaction(signedTxn.blob).do();
        console.log(response)
        setTimeout(getProfileChain, 12000);
    } catch(err) {
      console.error(err); 
    }
  };

useEffect(() => {
let body = {
  address : account
}
Axios.post("http://localhost:80/findwallet", body) 
.then(wallet => {
  if(wallet.data.message === "no wallet found with that address"){
    setNeedStore(true)
  }else if(wallet.data.storeAddress){
    setNeedStore(false)
  }
})
.catch(err => {
console.log("====================================")
console.log(`Something bad happened while fetching the data\n${err}`)
console.log("====================================")
})


block.algoGetAssetsByCreator("H4OU5NSZJPBCO5324EI37CJA4HFV2DTYP2DTFE6PLRG5HAUIVHRPLE7UNQ")
.then(result => {
    setCreatedNfts(result.data.assets)
    let arr = result.data.assets
    console.log(arr)
    let found = false
    for(let i = 0; i < arr.length; i++){
        if(arr[i].params['unit-name'] == "PRF"){
            found = true
            setProfileIndex(arr[i].index)
            i = arr.length
        }
        
    }
    if(!found){
      let obj = {
        profileName : "",
        bio : "",
        website: "",
        avatar : ""
      }
      setProfile(obj)
    }
})
.catch(err => {
console.log("====================================")
console.log(`Something bad happened while fetching the data\n${err}`)
console.log("====================================")
})
block.algoGetAccount(params.profileid)
.then(result => {
 if(result.data.account.assets){
  let arr = []
  let i = 0;
  result.data.account.assets.forEach(asset => {
      if(asset.amount > 0){
        let assetid = asset['asset-id']
        block.algoGetAsset(assetid)
        .then(assetResult => {
          let newElement = assetResult.data.asset
            if(newElement.params.url){
              if(newElement.params.url.startsWith("ipfs://")){
                        let s = "ipfs://"
                        let id = newElement.params.url.substring(s.length)
                        newElement.params.url = gateway + id
                    }
                    else if(newElement.params.url.startsWith("https://ipfs.io/ipfs/")){
                        let s = "https://ipfs.io/ipfs/"
                        let id = newElement.params.url.substring(s.length)
                        newElement.params.url = gateway + id
                    }
              arr.push(newElement)

              
            }
            i++;
            if(i === result.data.account.assets.length){
              setLoopDone(arr)
            }
         })
         .catch(err => {
           i++;
           if(i === result.data.account.assets.length){
            setLoopDone(arr)
          }
         console.log("====================================")
         console.log(`Something bad happened while fetching the data\n${err}`)
         console.log("====================================")
         })
      }else{
        i++;
      }
  });
 }
 
})
.catch(err => {
console.log("====================================")
console.log(`Something bad happened while fetching the data\n${err}`)
console.log("====================================")
})

}, []);

useEffect(() => {
    getProfileChain()
    }, [profileIndex]);

const getProfileChain = () =>{
  if(profileIndex){
      block.algoGetAssetTransactionByAddress(profileIndex, params.profileid)
      .then(result => {
        console.log(result.data)
          let latest = result.data.transactions.length -1 
          let i = 0
          let tran = undefined
          while(i < result.data.transactions.length){
            if(result.data.transactions[i]['asset-transfer-transaction']){
               tran = result.data.transactions[i]
               i = result.data.transactions.length
            }
            i++;
          }
          if(tran.note){
            let buff = new Buffer.from(tran.note, 'base64');
            let base64ToStringNew = buff.toString('ascii');
            setProfile(JSON.parse(base64ToStringNew))
          }
          
      })
      .catch(err => {
      let obj = {
        profileName : "",
        bio : "",
        website: "",
        avatar : ""
      }
      setProfile(obj)
      })
  }
}

    useEffect(() => {
      if(loopDone && loopDone.length > 0){
        setOwnedNfts(loopDone)
      }
      }, [loopDone]);
  
      useEffect(() => {
          console.log(selectedForShuffle)
        }, [selectedForShuffle]);

  
  return (
    <div>
      <br></br>
    <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
    <Grid item xs={4}>
    <WalletConnect setAccountChange={setAccountChange} myAlgoConnect ={myAlgoConnect}></WalletConnect>
    </Grid>
    <Grid item xs={4}>
    {account === params.profileid ? <div> 
    <Button variant="contained" onClick={handleEdit}>{editProfile ? "Exit Edit Mode" : "Edit Profile"}</Button>
      </div>
       :
      <div></div>}
    </Grid>
    {editProfile && profile ?
    <Grid item xs={4}> <Button variant="contained" onClick={saveProfile}>Save Profile</Button></Grid>
    :
    <Grid item xs={4}>
    {needStore ? 
       <Button variant="contained" onClick={generateStore}>Generate Store Wallet</Button>
      :
       <div></div>
    }
    </Grid>
    }
    </Grid>

    <br></br>
  
    {profile ?  
    <div>
      {editProfile ? 
      <div>   
        {profileHovered ? 
        
        <Tooltip title={"edit avatar"}>
          <Avatar
          style={{margin: "auto", display : "flex"}}
          onClick={editAvatar}
          onMouseEnter={profileHover}
          onMouseLeave={profileHoverLeave}
          alt={placeHolder}
          src={avatar}
          sx={{ width: 200, height: 200 }}
          />
        </Tooltip> 
      
        :
        
         <Avatar
         style={{margin: "auto", display : "flex"}}
          onMouseEnter={profileHover}
          onMouseLeave={profileHoverLeave}
          alt={placeHolder}
          src={avatar}
          sx={{ width: 200, height: 200 }}
          />

          }
        <br></br>
        <TextField style={{margin: "auto", display : "inline-block"}} value={profileName} onChange={changeProfileName} id="outlined-basic" label="Profile Name" variant="outlined" />
        <br></br>
        <TextField style={{margin: "auto", display : "inline-block"}} value={website} onChange={changeWebsite} id="filled-basic" label="Website" variant="outlined" />
        <br></br>
        <TextField style={{margin: "auto", display : "inline-block"}} value={bio} onChange={changeBio} id="standard-basic" label="Bio" variant="outlined" />
        
        
      </div> 
      : 
      <div>
    
    {profile.avatar ? 
    <Avatar
    style={{margin: "auto", display : "flex"}}
    alt={placeHolder}
    src={profile.avatar}
    sx={{ width: 200, height: 200 }}
    />
    :
    <Avatar
      style={{margin: "auto", display : "flex"}}
      alt={placeHolder}
      src={""}
      sx={{ width: 200, height: 200 }}
      />  
  }
      
  
    {profile.profileName ?  <h3>{profile.profileName}</h3> : <div></div>}
    {profile.website ?  <p>{profile.website}</p> : <div></div>}
    {profile.bio ?  <p>{profile.bio}</p> : <div></div>}
    <br></br>
    <br></br>
    <br></br>
    </div>
    }
    
      
    </div>
    :
    <div></div>
    }
    <br></br>
    {account === params.profileid ? <Button onClick={selectShuffle}>Shuffle</Button> : <div></div>}
    <h3>Gallery</h3>
    <br></br>
    <Box>
    <BigGrid>
    {ownedNfts ? 
        ownedNfts.map(function(nft, i){
        return <div key={i} ><LazyImage nft={nft} src={nft.params.url} small={false} shuffle={undefined}/><span>{nft.params.name}</span> </div>;
        })
    :
    <div></div>
    }
   </BigGrid>
   </Box>

   <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        style={{ overflow:'scroll'}}
        PaperProps={{ sx: { width: "50%", height: "90%" } }}
      >
        <Box>
        <SmallGrid>
        {ownedNfts ? 
            ownedNfts.map(function(nft, i){
            return <div onClick={()=>chooseAvatar(nft.params.url)} key={i} ><LazyImage nft={nft} src={nft.params.url}  small={true} shuffle={undefined}/><span>{nft.params.name}</span> </div>;
            })
        :
        <div></div>
        }
      </SmallGrid>
      </Box>  
      </Dialog>

      <Dialog      
        open={open2}
        onClose={handleClose2}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        style={{ overflow:'scroll'}}
        PaperProps={{ sx: { width: "50%", height: "90%" } }}
      >
        <Box textAlign='center'>
        <DialogTitle><Button  onClick={shuffleNfts}>Shuffle NFTs</Button></DialogTitle>
        <Input type="number" style={{margin: "auto", display : "inline-block"}} value={shufflePrice} onChange={changeShufflePrice} id="outlined-basic" label="Shuffle Price" variant="outlined" />
        <br></br>
        <Button onClick={shuffleImageChange}>Set Shuffle Image</Button>
        </Box>
        <Box>
        <SmallGrid>
        {ownedNfts ? 
            ownedNfts.map(function(nft, i){
            return <div  onClick={()=>selectShuffleNft(nft)} key={i}>{selectedForShuffle.some(selected => selected.index === nft.index) ? <div>{nft.params.url === shuffleImage ? <div style={{border : "red solid 3px"}}> <LazyImage nft={nft} src={nft.params.url}  small={true} shuffle={undefined}/><span>{nft.params.name}</span></div> : <div style={{border : "yellow solid 3px"}}> <LazyImage nft={nft} src={nft.params.url}  small={true} shuffle={undefined}/><span>{nft.params.name}</span></div>} </div> : <div><LazyImage nft={nft} src={nft.params.url}  small={true} shuffle={undefined}/><span>{nft.params.name}</span></div>} </div>;
            })
        :
        <div></div>
        }
      </SmallGrid>
      </Box>  
      </Dialog>

    
    </div>
  );
}

export default Profile;