import {Button} from '@mui/material'
import React, { useState, useEffect } from 'react';;



const WalletConnect = ({ setAccountChange, myAlgoConnect, Text }) => {
    const [accounts, setAccounts] = useState();


   

    useEffect(()=>{
        if(accounts){
            let oldAcc = localStorage.getItem('accountid')
            let account = accounts[0].address
            if(oldAcc!==account && localStorage.getItem("apiKey")){
                localStorage.removeItem("apiKey")
            }
            localStorage.setItem("accountid", account)
        
            
        }
    }, [accounts])
     
    
    const connectWallet2 = async ()=>{
        

        const settings = {
            shouldSelectOneAccount: false,
            openManager: false
        };
        try{
            setAccounts(await myAlgoConnect.connect(settings));
        }catch(e){
            console.log(e)
        }
        
        localStorage.setItem('isCached', "false")
        setAccountChange("true")
        
    }

    
    
 
    return(
        <div>
            <Button variant="contained" onClick={connectWallet2}>{Text}</Button>
        </div>

    )
}



export default WalletConnect;