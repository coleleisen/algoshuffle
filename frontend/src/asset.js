import React, { useState, useEffect } from 'react'
import {
  BrowserRouter,
  Routes,
  Route,
  useParams
} from "react-router-dom";
import './App.css';
import WalletConnect from './walletconnect';
import NftFinder from './nftfinder';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import MenuIcon from '@mui/icons-material/Menu';
import Box from '@mui/material/Box';
import BlockchainPull  from './services/blockchainpull';
import LazyImage from './lazyimage';



function Asset() {
let block =  new BlockchainPull()
let params = useParams();
const [url, setUrl] = useState("")
const [name, setName] = useState("")
const [nft, setNft] = useState()

useEffect(() => {
    block.algoGetAsset(params.assetid)
    .then(result => {
        setNft(result.data.asset)
        setUrl(result.data.asset.params.url)
        setName(result.data.asset.params.name)
    })
    .catch(err => {
      console.log("====================================")
      console.log(`Something bad happened while fetching the data\n${err}`)
      console.log("====================================")
    })
    
    
}, []);

  return (
    <div>
    <br></br>
    {nft ?  
    <div>
    <LazyImage nft={nft} src={url} small={false} shuffle={undefined}></LazyImage>
    <p>{name}</p> 
    </div>
    :
    <div></div>
    }
    
    </div>
  );
}

export default Asset;