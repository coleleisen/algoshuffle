import React, { useState, useEffect } from 'react'
import {
  useParams
} from "react-router-dom";
import './App.css';

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
    
// eslint-disable-next-line
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