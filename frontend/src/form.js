import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import AccountCircle from '@mui/icons-material/AccountCircle';
import React, { useState, useEffect } from 'react';

const Form = ({setNfts, fullNfts, ownedSwitch, setOwnedNfts, fullOwnedNfts}) =>{
    const [search, setSearch] = useState("");

    useEffect(()=>{
        setSearch("")
      
    }, [ownedSwitch])
    
    const handleInputChange = event =>{
        const query = event.target.value;
        setSearch(query)
        if(ownedSwitch){
            if(query.length < 1){
                setOwnedNfts(fullOwnedNfts)
            }else{
                let newNfts = fullOwnedNfts.filter(nft=> nft.params.name.toLowerCase().includes(query.toLowerCase()))
                setOwnedNfts(newNfts)
            }
        }else{
            if(query.length < 1){
                setNfts(fullNfts)
            }else{
                let newNfts = fullNfts.filter(nft=> nft.params.name.toLowerCase().includes(query.toLowerCase()))
                setNfts(newNfts)
            }
        }
    
        
      }
return(
    <TextField
        id="input-with-icon-textfield"
        onChange={handleInputChange}
        value={search}
        label="Find NFT"
        color="primary" 
        focused
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <AccountCircle />
            </InputAdornment>
          ),
        }}
        variant="standard"
      />
)
}



export default Form