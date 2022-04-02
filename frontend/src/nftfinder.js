import Axios from "axios"
import { FormControl, Box, Switch, FormGroup, FormControlLabel, CircularProgress } from "@mui/material";
import React, { useState, useEffect } from 'react';
import styled from 'styled-components'
import LazyImage from "./lazyimage";
import Form from "./form";
import BlockchainPull from "./services/blockchainpull";


const Grid = styled.section`
display: grid;
grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
row-gap: 1rem;
column-gap: 1rem;
padding: 1rem;
justify-items: center;
`;

const NftFinder = ({accountChange, setAccountChange}) => {
    const [fullNfts, setFullNfts] = useState([]);
    const [assets, setAssets] = useState([]);
    const [ownedNfts, setOwnedNfts] = useState([]);
    const [fullOwnedNfts, setFullOwnedNfts] = useState([]);
    const [nfts, setNfts] = useState([]);
    const[ownedSwitch, setOwnedSwitch] = useState(false);
    const[loopDone, setLoopDone] = useState(false);
    const[loopRunning, setLoopRunning] = useState(false);
    const[loadingNfts, setLoadingNfts] = useState(false);
    let gateway = "https://gateway.pinata.cloud/ipfs/"
    let block =  new BlockchainPull()


    useEffect(() => {
        setOwnedNfts(localStorage.getObj("ownedNfts"))
        setFullOwnedNfts(localStorage.getObj("ownedNfts"))
        
        let creator = "LANKZYW5QDFPDB4RYI3BH7MMCAYKOZUAFIE4VNDSKKTY26YCCSSRFRTYAA";
        let account = localStorage.getItem("accountid")
        //let account = "HPIVYHDE45N6TMUV3RP3TMC2KLGCCCGV3SAR5M4CCP52ZAG6DF6GGKYG7E"
        
        if(account){
            block.algoGetAccount(account)
            .then(result => {
                
                setAssets(result.data.account.assets)
            })
            .catch(err => {
            console.log("====================================")
            console.log(`Something bad happened while fetching the data\n${err}`)
            console.log("====================================")
            })
            
        }
        
        block.algoGetAssetsByCreator(creator)
        .then(result => {
            
            setNfts(result.data.assets)
            setFullNfts(result.data.assets)
        })
        .catch(err => {
          console.log("====================================")
          console.log(`Something bad happened while fetching the data\n${err}`)
          console.log("====================================")
        })
        

      }, []);

    Storage.prototype.setObj = function(key, obj) {
        return this.setItem(key, JSON.stringify(obj))
    }
    Storage.prototype.getObj = function(key) {
        return JSON.parse(this.getItem(key))
    }

    function myLoop(arr, i, j) {       
    setTimeout(function() { 
        if(j > 4){
            j = 0;
            i++;
        }  
        let asset = arr[i]  
        if(asset){
            if(asset.amount > 0){
                let assetid = asset['asset-id']
                block.algoGetAsset(assetid)
                .then(result => {
                    let newElement = result.data.asset
                    
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

                    let owned = localStorage.getObj("ownedNfts");
                    if(owned === null){
                        owned = [];
                    }
                    // NOTE find more effecient solution
                    if(!owned.some((el => el.params.url === newElement.params.url))){
                        owned.push(newElement);
                        localStorage.setObj("ownedNfts", owned)
                        setOwnedNfts(owned)
                    }
                    i++;
                    j=0; 
                    if (i < arr.length) {           
                        myLoop(arr, i, j);             
                    }else{
                        setLoopDone(true)
                    }  
                })
                .catch(err => {
                j++;
                console.log(`Something bad happened while fetching the data\n${err}`)  
                if (i < arr.length) {           
                    myLoop(arr, i, j);             
                }else{
                    setLoopDone(true)
                }  
                })
            }else{
                i++;
                if (i < arr.length) {           
                    myLoop(arr, i, j);             
                }else{
                    setLoopDone(true)
                }  
            }
        }                      
    }, 1000)
    }

      useEffect(()=>{
        let myValue = localStorage.getItem('isCached')
        let iscached = (myValue === 'true');
        let cachedate = Date.parse(localStorage.getItem("ownedNftCacheTime"))
        let today = Date.parse(new Date().toDateString())
        if(assets.length > 0 && (cachedate !== today || !iscached) && !loopRunning){
            let i = 0;
            let j = 0;
            
            localStorage.setObj("ownedNfts", [])
            setOwnedNfts([])
            setLoadingNfts(true)
            setLoopRunning(true)
            setLoopDone(false)
            myLoop(assets, i, j)   
        }
        
      }, [assets])

      useEffect(()=>{
          
        if(loopDone){
            
            setLoopRunning(false)
            setLoadingNfts(false)
            let owned = localStorage.getObj("ownedNfts")
            if(owned.length > 0){
                let today = new Date();
                localStorage.setItem("ownedNftCacheTime", today.toDateString())
            }
           setOwnedNfts(owned) 
           setFullOwnedNfts(owned)
           localStorage.setItem("isCached", "true")
           setAccountChange("false")
        }
      }, [loopDone])
    
      const changeOwned = () =>{
         if(ownedSwitch){
            setOwnedSwitch(false)
         }else{
             setOwnedSwitch(true)
         }
         
      }
      useEffect(()=>{
        if(ownedSwitch){
            setOwnedNfts(fullOwnedNfts)
        }else{
            setNfts(fullNfts)
        }
      
    }, [ownedSwitch])




    useEffect(()=>{
        
        if(accountChange==="true"){ 
            let arr = JSON.parse(JSON.stringify(assets))
            if(arr.length < 1){
                let account = localStorage.getItem("accountid")
                block.algoGetAccount(account)
                .then(result => {
                    console.log(result.data.account.assets)
                    setAssets(result.data.account.assets)
                })
                .catch(err => {
                setAssets(arr)
                console.log("====================================")
                console.log(`Something bad happened while fetching the data\n${err}`)
                console.log("====================================")
                })
            }else{
                setAssets(arr)
            }
            
        }
      
    }, [accountChange])
     

    const gotoAsset = () =>{
        
      }
    
 
    return(
        <div>
        <Form  setNfts={setNfts} fullNfts={fullNfts} ownedSwitch={ownedSwitch} setOwnedNfts={setOwnedNfts} fullOwnedNfts={fullOwnedNfts}></Form>
        <Box style={{display:"flex",bgcolor:"lightgreen",alignItems:"center",justifyContent:"center"}}>
        <FormGroup>
        {ownedNfts ? <FormControlLabel control={<Switch  value={ownedSwitch} onChange={changeOwned} />} label="Owned" /> :
        <FormControlLabel control={<Switch  value={ownedSwitch} disabled />} label="Must hook up account to see owned nfts" />
        }

        </FormGroup>
        </Box>
        {ownedSwitch ? 
            <div>
            <h1>Owned</h1>
            <br></br>
            {loadingNfts ? <div><CircularProgress /></div>
            
            :

            <div></div>}
            
            <Grid >    
            {ownedNfts.map(function(nft, i){
            return <div key={i} ><LazyImage nft={nft} src={nft.params.url} small={false} shuffle={undefined}/><span>{nft.params.name}</span> </div>;
            })}
            </Grid>
            
            </div> 
            : 
            <Grid>
            {nfts.map(function(nft, i){
            return <div key={i}><LazyImage nft={nft} src={nft.params.url} small={false} shuffle={undefined}/><span>{nft.params.name}</span> </div>;
            })}
            </Grid>}
            </div>
    )
}




export default NftFinder;