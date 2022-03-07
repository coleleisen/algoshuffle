import Axios from "axios"

//const url = "https://mainnet-algorand.api.purestake.io/idx2"
const url = "https://testnet-algorand.api.purestake.io/idx2";
const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  Axios.defaults.headers.common = {
    "X-API-Key": "BFzlkNCYOkxXwEtQXnGl6X7u2iwmyYd146i92hHb",
  };

class BlockchainPull {
    constructor() { }

  //ALGO
  
  algoGetAccount(account){
    let body = {}
    let route = "/v2/accounts/"
    return Axios.get(url + route + account, body, config)
  }

  algoGetAssetsByCreator(creator){
    let body = {}
    let route = "/v2/assets?creator="
    return Axios.get(url + route + creator + "&limit=10000", body, config)
  }

  algoGetAsset(assetid){
    let body = {}
    let route = "/v2/assets/"
    return Axios.get(url + route + assetid, body, config)
  }


  algoGetAssetTransaction(assetid){
    let body = {}
    let route = "/v2/assets/"
    let route2 = "/transactions"
    return Axios.get(url + route + assetid + route2 , body, config)
  }
  algoGetAssetTransactionByAddress(assetid, address){
    let body = {}
    let route = "/v2/assets/"
    let route2 = `/transactions?address=${address}`
    return Axios.get(url + route + assetid + route2 , body, config)
  }

}

export default BlockchainPull;