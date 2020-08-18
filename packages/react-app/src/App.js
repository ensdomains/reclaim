import React, { useState, useEffect } from "react";
import { Contract } from "@ethersproject/contracts";
import { JsonRpcProvider, Web3Provider, InfuraProvider } from "@ethersproject/providers";
import namehash from 'eth-ens-namehash';
import { gql } from "apollo-boost";
import { useQuery } from "@apollo/react-hooks";
import { abis } from "@project/contracts";
import "./App.css";

const imgData = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2aWV3Qm94PSIwIDAgNzIuNTIgODAuOTUiPjxkZWZzPjxzdHlsZT4uY2xzLTN7ZmlsbDojYTBhOGQ0fTwvc3R5bGU+PGxpbmVhckdyYWRpZW50IGlkPSJsaW5lYXItZ3JhZGllbnQiIHgxPSI0MS45NSIgeTE9IjIuNTciIHgyPSIxMi41NyIgeTI9IjM0LjQyIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHN0b3Agb2Zmc2V0PSIuNTgiIHN0b3AtY29sb3I9IiNhMGE4ZDQiLz48c3RvcCBvZmZzZXQ9Ii43MyIgc3RvcC1jb2xvcj0iIzg3OTFjNyIvPjxzdG9wIG9mZnNldD0iLjkxIiBzdG9wLWNvbG9yPSIjNjQ3MGI0Ii8+PC9saW5lYXJHcmFkaWVudD48bGluZWFyR3JhZGllbnQgaWQ9ImxpbmVhci1ncmFkaWVudC0yIiB4MT0iNDIuNTciIHkxPSI4MS42NiIgeDI9IjcxLjk2IiB5Mj0iNDkuODEiIHhsaW5rOmhyZWY9IiNsaW5lYXItZ3JhZGllbnQiLz48bGluZWFyR3JhZGllbnQgaWQ9ImxpbmVhci1ncmFkaWVudC0zIiB4MT0iNDIuMjYiIHkxPSIxLjI0IiB4Mj0iNDIuMjYiIHkyPSI4Mi44NCIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPjxzdG9wIG9mZnNldD0iMCIgc3RvcC1jb2xvcj0iIzUxM2VmZiIvPjxzdG9wIG9mZnNldD0iLjE4IiBzdG9wLWNvbG9yPSIjNTE1N2ZmIi8+PHN0b3Agb2Zmc2V0PSIuNTciIHN0b3AtY29sb3I9IiM1Mjk4ZmYiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiM1MmU1ZmYiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48ZyBzdHlsZT0iaXNvbGF0aW9uOmlzb2xhdGUiPjxnIGlkPSJMYXllcl8xIiBkYXRhLW5hbWU9IkxheWVyIDEiPjxwYXRoIGQ9Ik0xNS4yOCAzNC4zOWMuOCAxLjcxIDIuNzggNS4wOSAyLjc4IDUuMDlMNDAuOTUgMS42NGwtMjIuMzQgMTUuNmE5Ljc1IDkuNzUgMCAwIDAtMy4xOCAzLjUgMTYuMTkgMTYuMTkgMCAwIDAtLjE1IDEzLjY1eiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTYgLTEuNjQpIiBmaWxsPSJ1cmwoI2xpbmVhci1ncmFkaWVudCkiLz48cGF0aCBjbGFzcz0iY2xzLTMiIGQ9Ik02LjIxIDQ2Ljg1YTI1LjQ3IDI1LjQ3IDAgMCAwIDEwIDE4LjUxbDI0LjcxIDE3LjIzcy0xNS40Ni0yMi4yOC0yOC41LTQ0LjQ1YTIyLjM5IDIyLjM5IDAgMCAxLTIuNjItNy41NiAxMi4xIDEyLjEgMCAwIDEgMC0zLjYzYy0uMzQuNjMtMSAxLjkyLTEgMS45MmEyOS4zNSAyOS4zNSAwIDAgMC0yLjY3IDguNTUgNTIuMjggNTIuMjggMCAwIDAgLjA4IDkuNDN6IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtNiAtMS42NCkiLz48cGF0aCBkPSJNNjkuMjUgNDkuODRjLS44LTEuNzEtMi43OC01LjA5LTIuNzgtNS4wOUw0My41OCA4Mi41OSA2NS45MiA2N2E5Ljc1IDkuNzUgMCAwIDAgMy4xOC0zLjUgMTYuMTkgMTYuMTkgMCAwIDAgLjE1LTEzLjY2eiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTYgLTEuNjQpIiBmaWxsPSJ1cmwoI2xpbmVhci1ncmFkaWVudC0yKSIvPjxwYXRoIGNsYXNzPSJjbHMtMyIgZD0iTTc4LjMyIDM3LjM4YTI1LjQ3IDI1LjQ3IDAgMCAwLTEwLTE4LjUxTDQzLjYxIDEuNjRzMTUuNDUgMjIuMjggMjguNSA0NC40NWEyMi4zOSAyMi4zOSAwIDAgMSAyLjYxIDcuNTYgMTIuMSAxMi4xIDAgMCAxIDAgMy42M2MuMzQtLjYzIDEtMS45MiAxLTEuOTJhMjkuMzUgMjkuMzUgMCAwIDAgMi42Ny04LjU1IDUyLjI4IDUyLjI4IDAgMCAwLS4wNy05LjQzeiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTYgLTEuNjQpIi8+PHBhdGggZD0iTTE1LjQzIDIwLjc0YTkuNzUgOS43NSAwIDAgMSAzLjE4LTMuNWwyMi4zNC0xNS42LTIyLjg5IDM3Ljg1cy0yLTMuMzgtMi43OC01LjA5YTE2LjE5IDE2LjE5IDAgMCAxIC4xNS0xMy42NnpNNi4yMSA0Ni44NWEyNS40NyAyNS40NyAwIDAgMCAxMCAxOC41MWwyNC43MSAxNy4yM3MtMTUuNDYtMjIuMjgtMjguNS00NC40NWEyMi4zOSAyMi4zOSAwIDAgMS0yLjYyLTcuNTYgMTIuMSAxMi4xIDAgMCAxIDAtMy42M2MtLjM0LjYzLTEgMS45Mi0xIDEuOTJhMjkuMzUgMjkuMzUgMCAwIDAtMi42NyA4LjU1IDUyLjI4IDUyLjI4IDAgMCAwIC4wOCA5LjQzem02MyAzYy0uOC0xLjcxLTIuNzgtNS4wOS0yLjc4LTUuMDlMNDMuNTggODIuNTkgNjUuOTIgNjdhOS43NSA5Ljc1IDAgMCAwIDMuMTgtMy41IDE2LjE5IDE2LjE5IDAgMCAwIC4xNS0xMy42NnptOS4wNy0xMi40NmEyNS40NyAyNS40NyAwIDAgMC0xMC0xOC41MUw0My42MSAxLjY0czE1LjQ1IDIyLjI4IDI4LjUgNDQuNDVhMjIuMzkgMjIuMzkgMCAwIDEgMi42MSA3LjU2IDEyLjEgMTIuMSAwIDAgMSAwIDMuNjNjLjM0LS42MyAxLTEuOTIgMS0xLjkyYTI5LjM1IDI5LjM1IDAgMCAwIDIuNjctOC41NSA1Mi4yOCA1Mi4yOCAwIDAgMC0uMDctOS40M3oiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC02IC0xLjY0KSIgc3R5bGU9Im1peC1ibGVuZC1tb2RlOmNvbG9yIiBmaWxsPSJ1cmwoI2xpbmVhci1ncmFkaWVudC0zKSIvPjwvZz48L2c+PC9zdmc+'
const GET_LABEL_NAME = gql`
query Account($account: String!){
  account(id:$account){
		id
    domains{
      id
      labelhash
      labelName
    }
  }
}
`;

const GET_STATS = gql`
query {
	statsEntity(id:""){
    id
    numOfDeeds
    currentValue
    accumValue
  }
}
`

const GET_ACCOUNTS = gql`
query Account($account: String!){
  account(id:$account){
    id
    deeds {
      id
      value
      name {
        id
      }
    }
  }
}
`

function App({
  ensClient, registrarAddress, registryAddress, stage
}) {
  const [provider, setProvider] = useState(false)
  const [account, setAccount] = useState('')
  const [network, setNetwork] = useState('')
  const [address, setAddress] = useState(false)
  const [value, setValue] = useState('')
  const [connected, setConnected] = useState(false)
  const [message, setMessage] = useState(false)
  const [warning, setWarning] = useState(false)
  const { data:accountData } = useQuery(GET_ACCOUNTS, {variables: { account }});
  const { data:labelData } = useQuery(GET_LABEL_NAME, {variables: { account }, client:ensClient});
  const { data:{ statsEntity } = {} } = useQuery(GET_STATS);
  const checkAccount = async(signer) =>{
    const res = await signer.getAddress()
    setAddress(res.toLowerCase())
    setValue(res.toLowerCase())
    setAccount(res.toLowerCase())
  }
  const lookupName = async(provider, label) => {
    if (!label.match(/\.eth/)) return false
    let encoded, registry
    try{
      encoded = namehash.hash(label)
      registry = new Contract(registryAddress, abis.registry, provider);
      const res = await registry.owner(encoded)
      return res
    }catch(e){
      setMessage('Problem looking up the name')
      return false
    }
  }

  const handleInput = async(event)=>{
    let label = event.target.value.toLowerCase()
    const name  = await lookupName(provider, label)
    setValue(label.toLowerCase())
    if(!name || name === '0x0000000000000000000000000000000000000000'){
      setAccount(label.toLowerCase())
    }else{
      setAccount(name.toLowerCase())
    }
  }

  const releaseDeed = async(provider, label) =>{
    const signer = provider.getSigner()  
    const registrar = new Contract(registrarAddress, abis.registrar, provider);
    const registrarWithSigner = registrar.connect(signer)
    // A pre-defined address that owns some CEAERC20 tokens
    const tx = await registrarWithSigner.releaseDeed(label)
    setMessage('Transaction has been sent')
  }
  
  const connect = async(ethereum) =>{
    await ethereum.request({ method: 'eth_requestAccounts' })
  }
  
  const checkNetwork = async(provider) => {
    let ret = provider && await provider.getNetwork()
    setNetwork(ret.chainId)
  }

  let signer
  useEffect(() => {
    if (window && window.ethereum) {
      connect(window.ethereum)
      setProvider(new Web3Provider(window.ethereum))
      signer = provider && provider.getSigner()
      if(connected){
        if(!address){
          if (signer) checkAccount(signer)
        }
      }else{
        setConnected(true)
      }  
    }else{
      if(stage === 'live'){
        setProvider(new InfuraProvider())
      }else{
        setProvider(new JsonRpcProvider('http://localhost:8545'))
      }
    }
    checkNetwork(provider)
    if(connected){
      if(network !== 1){
        setWarning('You are connected to the wrong network(only mainnet is supported)')
      }else{
        setWarning(false)
      }
    }else{
      setWarning('Your browser is not connected to wallet (eg: Metamask)')
    }
  }, [window, account, connected, address, network, warning])
  const isOwner = (address && address.toLowerCase()) === (account && account.toLowerCase())
  let deeds = []
  if(accountData && accountData.account){
    deeds = accountData.account.deeds
  }
  const domains = deeds.map(deed => {
    const label = labelData && labelData.account && labelData.account.domains.filter((domain) => domain.labelhash === deed.name.id )[0]
    return {
      id:deed.id,
      name:label && label.labelName,
      labelhash:deed.name.id,
      value:(deed.value / Math.pow(10,18))
    }
  })
  const sum = domains.map(d => d.value).reduce((a,b)=> parseFloat(a)+parseFloat(b), 0)
  return (
    <div className="App">
      <header className="App-header">
        <img src={imgData} className="App-logo" alt="react-logo" />
        {/* Remove the "display: none" style and open the JavaScript console in the browser to see what this function does */}
      <h2>Unclaimed deposit search</h2>
      {warning && (<span style={{color:'yellow', marginBottom:'5px'}}>{warning}</span>)}
      <input onChange={handleInput} placeholder="Enter ENS name or ETH address" value={value} ></input>
      {domains && (
          <>
            <div style={{marginTop:'5px'}}>{account}</div>
            {value && (<div>owns { domains.length === 100 ? 'more than' : '' } {domains.length} (worth {sum.toFixed(2)} ETH) name{ domains.length === 1 ? '' : 's'} to claim deposit</div>)}
            <ul>
              {
                domains.map((d) => {

                  const displayName = d.name ? `${d.name}.eth` : `${d.labelhash && d.labelhash.slice(0,5)}...`
                  return(
                    <li>
                      <span>{displayName} has {d.value} ETH deposit</span>
                      {
                        connected && isOwner && (
                          <button onClick={() => releaseDeed(provider, d.labelhash)} >
                            Claim
                          </button>
                        )
                      }
                    </li>      
                  )
                })
              }
            </ul>
            <span style={{width:"60%", marginBottom:"1em", color:"yellow"}}>{message}</span>
            {domains.length > 0 && !isOwner ? (
              <span style={{width:"60%", marginBottom:"1em"}}>To claim back the deposit, you need to connect to the wallet which auctioned off the names</span>
            ): ''}
          </> 
        )
      }
      </header>
      <div className="App-body">
        { statsEntity && <>
          There are currently {statsEntity.numOfDeeds} deeds holding {(statsEntity.currentValue / Math.pow(10,18)).toFixed(2)} ETH <br/>
          To understand more about these unclaimed deposits, <a href="https://medium.com/@makoto_inoue/how-to-get-back-the-unclaimed-deposit-1e2b1767b930">read the blog post</a>.
          <br/>
          Bootstrapped with <a href="https://github.com/PaulRBerg/create-eth-app">Create Eth App</a>
        </>}
      </div>
    </div>
  );
}

export default App;
