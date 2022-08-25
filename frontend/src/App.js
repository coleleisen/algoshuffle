import React, { useState, useEffect} from 'react'

import {

  Routes,
  Route,
  useNavigate
} from "react-router-dom";
import './App.css';
import WalletConnect from './walletconnect';
import Profile from './profile'
import Shuffle from './shuffle'
import Asset from './asset'
import ShuffleFinder from './shufflefinder';
import {Snackbar, Alert } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import MenuIcon from '@mui/icons-material/Menu';
import Box from '@mui/material/Box'
import MyAlgoConnect from '@randlabs/myalgo-connect';

import {Env_UsingDockerBuild} from './environment-variables';
import ErrorBoundary from './errorboundary';



function App() {
  let backend = "http://localhost:80";
  if (Env_UsingDockerBuild){
    backend = "/api";
  }
  const [accountChange, setAccountChange] = useState("false");
  const [errorMessage, setErrorMessage] = React.useState("");
  const [errorPresent, setErrorPresent] = React.useState(false);
  const myAlgoConnect = new MyAlgoConnect({ disableLedgerNano: false })
  const account = localStorage.getItem("accountid")
  const navigate = useNavigate();

  const gotoProfile = () =>{
    navigate(`/profile/${account}`);
  }

  const etGoHome = () =>{
    navigate('')
  }

  const triggerError = (err) =>{
    setErrorMessage(err)
    setErrorPresent(true)
  }

  const errorTimeout = () =>{
    setErrorPresent(false)
  }

  useEffect(() => {
    window.addEventListener("unhandledrejection", event => {
      console.log(event)
    });
    
  }, []);

 

  return (
    <div className="App">
        <ErrorBoundary>
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
            {account ? <Button variant="contained" onClick={gotoProfile}>Profile</Button> : <WalletConnect setAccountChange={setAccountChange} myAlgoConnect ={myAlgoConnect} Text={"Connect Algo Wallet"}></WalletConnect>}
            
          </Toolbar>
        </AppBar>
      </Box>
      
      <Routes>
        <Route path="/"  element={<ShuffleFinder myAlgoConnect={myAlgoConnect} setAccountChange={setAccountChange} accountChange={accountChange} backend={backend} triggerError={triggerError}></ShuffleFinder>} />  
        <Route path="profile/:profileid" element={<Profile myAlgoConnect={myAlgoConnect} setAccountChange={setAccountChange} backend={backend} triggerError={triggerError} />}/>
        <Route path="asset/:assetid" element={<Asset />}/>
        <Route path="shuffle/:shuffleid" element={<Shuffle backend={backend} />}/>
        </Routes>
    
        <Snackbar
          anchorOrigin={{'horizontal' : 'center', 'vertical' : 'top'}}
          open={errorPresent}
          onClose={errorTimeout}
          autoHideDuration={5000}
          message={errorMessage}
          >
        <Alert severity="error">{errorMessage}</Alert>
      </Snackbar> 
      </ErrorBoundary>
    </div>
  );
}

export default App;
