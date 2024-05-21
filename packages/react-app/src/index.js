import React from "react";
import ReactDOM from "react-dom";
import ApolloClient from "apollo-boost";
import { ApolloProvider } from "@apollo/react-hooks";
import "./index.css";
import App from "./App";

// You should replace this url with your own and put it into a .env file
// See all subgraphs: https://thegraph.com/explorer/
console.log({ENV:process.env})

let stage, reclaimUri, ensUri, registryAddress, registrarAddress
// if (process.env.REACT_APP_STAGE === 'live'){
  stage = 'live'
  reclaimUri = process.env.RECLAIM_GRAPH_URI || "http://127.0.0.1:8000/subgraphs/name/makoto/ens-reclaim-deposit-subgraph"
  ensUri = process.env.ENS_GRAPH_URI || "http://127.0.0.1:8000/subgraphs/name/graphprotocol/ens"
  registrarAddress = '0x6090a6e47849629b7245dfa1ca21d94cd15878ef'
  registryAddress = '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e'
// }else{
//   stage = 'dev'
//   reclaimUri = "http://127.0.0.1:8000/subgraphs/name/makoto/ens-reclaim-deposit-subgraph"
//   ensUri = "http://127.0.0.1:8000/subgraphs/name/graphprotocol/ens"
//   registrarAddress = '0xA47b9D846D03E74C736D650dfb23D085C773AFCE'
//   registryAddress = '0x7F90FA6F67Aa366D8ca17d36a1B2E5A06C647151'
// }

const client = new ApolloClient({ uri: reclaimUri });
const ensClient = new ApolloClient({ uri: ensUri });

ReactDOM.render(
  <ApolloProvider client={client} >
    <App ensClient={ensClient} registrarAddress={registrarAddress} registryAddress={registryAddress} stage={stage} />
  </ApolloProvider>,
  document.getElementById("root"),
);
