import {Button} from '@mui/material'
import React, { useState, useEffect } from 'react';;



const WalletConnect = ({ setAccountChange, myAlgoConnect }) => {
    const [accounts, setAccounts] = useState();


   

    useEffect(()=>{
        if(accounts){
            let account = accounts[0].address
            localStorage.setItem("accountid", account)
        }
    }, [accounts])
     
    
    const connectWallet2 = async ()=>{
        

        const settings = {
            shouldSelectOneAccount: false,
            openManager: false
        };
        
        setAccounts(await myAlgoConnect.connect(settings));
        localStorage.setItem('isCached', "false")
        setAccountChange("true")
        
    }

    
    
 
    return(
        <div>
            <Button variant="contained" onClick={connectWallet2}>Connect Algo Wallet</Button>
        </div>

    )
}



export default WalletConnect;