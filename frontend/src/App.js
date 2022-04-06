import React, { useState, useEffect} from 'react'

import {
  BrowserRouter,
  Router,
  Routes,
  Route,
  useNavigate
} from "react-router-dom";
import './App.css';
import WalletConnect from './walletconnect';
import Profile from './profile'
import Shuffle from './shuffle'
import Asset from './asset'
import NftFinder from './nftfinder';
import ShuffleFinder from './shufflefinder';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import MenuIcon from '@mui/icons-material/Menu';
import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import MyAlgoConnect from '@randlabs/myalgo-connect';

import {Env_UsingDockerBuild} from './environment-variables';


function App() {
  let backend = "http://localhost:80";
  if (Env_UsingDockerBuild){
    backend = "/api";
  }
  const [accountChange, setAccountChange] = useState("false");
  const myAlgoConnect = new MyAlgoConnect({ disableLedgerNano: false })
  const account = localStorage.getItem("accountid")
  const navigate = useNavigate();

  const gotoProfile = () =>{
    navigate(`/profile/${account}`);
  }

  const etGoHome = () =>{
    navigate('')
  }

  return (
    <div className="App">
        <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
              onClick={etGoHome}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h3" component="div" sx={{ flexGrow: 1 }}>
              Algo Shuffle
            </Typography>
            {account ? <Button variant="contained" onClick={gotoProfile}>Profile</Button> : <WalletConnect setAccountChange={setAccountChange} myAlgoConnect ={myAlgoConnect}></WalletConnect>}
            
          </Toolbar>
        </AppBar>
      </Box>
      
      <Routes>
        <Route path="/"  element={<ShuffleFinder myAlgoConnect={myAlgoConnect} setAccountChange={setAccountChange} accountChange={accountChange} backend={backend}></ShuffleFinder>} />  
        <Route path="profile/:profileid" element={<Profile myAlgoConnect={myAlgoConnect} setAccountChange={setAccountChange} backend={backend} />}/>
        <Route path="asset/:assetid" element={<Asset />}/>
        <Route path="shuffle/:shuffleid" element={<Shuffle backend={backend} />}/>
        </Routes>
    
    </div>
  );
}

export default App;
