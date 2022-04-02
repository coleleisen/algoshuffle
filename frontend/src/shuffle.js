import React, { useState, useEffect } from 'react'
import {
  BrowserRouter,
  Routes,
  Route,
  useParams
} from "react-router-dom";
import './App.css';
import Box from '@mui/material/Box';
import styled from 'styled-components';
import BlockchainPull  from './services/blockchainpull';
import LazyImage from './lazyimage';
import Axios from "axios"


const BigGrid = styled.section`
display: grid;
grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
row-gap: 1rem;
column-gap: 1rem;
padding: 1rem;
justify-items: center;
`;

function Shuffle(backend) {
let gateway = "https://gateway.pinata.cloud/ipfs/"
let block =  new BlockchainPull()
let params = useParams();
const [url, setUrl] = useState("")
const [loopDone, setLoopDone] = React.useState([]);
const [ownedNfts, setOwnedNfts] = React.useState([]);
const [name, setName] = useState("")
const [shuffle, setShuffle] = useState()


useEffect(() => {
    let obj = {
        address : params.shuffleid
    }
    Axios.post(`${backend}/instantshuffle/find`, obj)
    .then(result => {
        console.log(result.data)
        setShuffle(result.data.shuffle)
        
    })
    .catch(err => {
    console.log(`Something bad happened while fetching the data\n${err}`)
    })

  block.algoGetAccount(obj.address)
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
  if(loopDone && loopDone.length > 0){
    setOwnedNfts(loopDone)
  }
  }, [loopDone]);

  return (
    <div>
    <br></br>
    <h1>{params.shuffleid}</h1>
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
    </div>
  );
}

export default Shuffle;