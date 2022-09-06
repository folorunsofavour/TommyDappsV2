import React, { useState, useEffect } from "react";
import toast, { Toaster } from 'react-hot-toast';

const { MerkleTree } = require('merkletreejs')
const keccak256 = require('keccak256')
const whitelist = require('../utils/whitelist.json')

import {
  getNoWLNft,
  getNoFreeNft,
  getMaxNoFreeNft,
  getTotalSupply,
  getNftPrice,
  mintPublic,
  getSaleState,
  checkOnlyWhitelist,
  connectWallet,
  getCurrentWalletConnected,
  mintWhiteList,
  getMaxSupply,
  getMaxMintPerTx,
  getBalnceOFwl,
} from "../utils/interact";

const Hero = () => {

  const [count, setCount] = useState(1);
  const [maxMintAmount, setMaxMintAmount] = useState(0);
  const [totalSupply, setTotalSupply] = useState(0);
  const [nftPrice, setNftPrice] = useState(0);
  const [noWLNft, setNoWLNft] = useState(0);
  const [noFreeNft, setNoFreeNft] = useState(0);
  const [whitelistValid, setWLValid] = useState(false)
  const [isSaleActive, setIsSaleActive] = useState(false);
  const [maxNoFreeNft, setMaxNoFreeNft] = useState(0);
  const [isWhiteList, setIsWhiteList] = useState(false);
  const [noForAddrWl, setNoForAddrWl] = useState(0);
  const [loadingPage, setLoadingPage] = useState(true);
  const [walletAddress, setWalletAddress] = useState("");
  const [maxSupply, setMaxSupply] = useState(0);


  const [loading, setLoading] = useState(false);


  const addWalletListener = () => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", async (accounts) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
        } else {
          setWalletAddress("");
        }
      });
    }
  };

  const connectWalletPressed = async () => {
    const walletResponse = await connectWallet();
    setWalletAddress(walletResponse.address);
    if(walletResponse.status != "") toast(walletResponse.status);
  };

  const leafNodes1 = whitelist.map((addr) => keccak256(addr))
  const merkleTreeWL = new MerkleTree(leafNodes1, keccak256, { sortPairs: true })
  const rootWL = merkleTreeWL.getRoot()


 

  useEffect(() => {
    const currentWalletData = async () => {
      if(walletAddress != ""){
        setLoadingPage(true);

        if(isWhiteList){
          const leaf = keccak256(walletAddress)
          const proofWL = merkleTreeWL.getHexProof(leaf)
          const isValidWL = merkleTreeWL.verify(proofWL, leaf, rootWL)
          // console.log("Proof wl "+proofWL)
          setWLValid(isValidWL);
  
          let wlBalance = parseInt(await getBalnceOFwl(walletAddress));
          let noOfWLNft = parseInt(await getNoWLNft());
          let totalsup = parseInt(await getTotalSupply());
          let maxfeenft = parseInt(await getMaxNoFreeNft());
          let noOffreeNft = parseInt(await getNoFreeNft());
  
          {parseInt(totalsup) < parseInt(maxfeenft) ? setMaxMintAmount(noOffreeNft) : setMaxMintAmount(noOfWLNft - wlBalance)}
          
          setNoForAddrWl(wlBalance);
          setNoFreeNft(noOffreeNft);
          setNoWLNft(noOfWLNft); 
        }
  
        toast.success("Connected: "+String(walletAddress).substring(0, 6) +"..." +String(walletAddress).substring(38));
        setLoadingPage(false);
      }
    };

    currentWalletData();
  }, [walletAddress, isWhiteList])

  useEffect(() => {
    const fetchData = async () => {
      
      setMaxSupply(await getMaxSupply());
      setNftPrice(await getNftPrice())
      setIsSaleActive(await getSaleState());
      setIsWhiteList(await checkOnlyWhitelist());
      setMaxNoFreeNft(await getMaxNoFreeNft());
      setTotalSupply(await getTotalSupply());
      {!isWhiteList ? setMaxMintAmount(await getMaxMintPerTx()) : 0};
      const walletResponse = await getCurrentWalletConnected();
      setWalletAddress(walletResponse.address);
      setLoadingPage(false);

    };
    fetchData();
    addWalletListener();
  },[]);

  const updateTotalSupply = async () => {
    const mintedCount = await getTotalSupply();
    setTotalSupply(mintedCount);
    const noWLNft = await getNoWLNft();
    setNoWLNft(noWLNft); 
    setCount(1);

    if (walletAddress != "" && isWhiteList) {
      let noForAddrWl = await getBalnceOFwl(walletAddress);
      setNoForAddrWl(noForAddrWl);
    }
  };

  const incrementCount = () => {
    if (count < maxMintAmount) {
      setCount(count + 1);
    }
  };

  const decrementCount = () => {
    if (count > 1) {
      setCount(count - 1);
    }
  };

  const mintP = async () => {
    setLoading(true);
    const { status, success } = await mintPublic(count);

    if(success){
      toast.success(status);
      await updateTotalSupply();
    }else{
      toast.error(status);
    }

    setLoading(false);
  };

  const mintWl = async () => {
    setLoading(true);
    const { status, success } = await mintWhiteList( count);

    if(success){
      await updateTotalSupply();
      toast.success(status);
    }else{
      toast.error(status);
    }

    setLoading(false);
  };

  const mintSectionCount = () => {
    return (
      <>
      <div className="bg-white flex items-center border-2 border-black rounded-full mt-6 text-base font-bold text-black" style={{height: '50px'}}>
        <button
            className="flex items-center justify-center w-7 h-12"
            onClick={decrementCount}
          >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 text-black ml-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="4"
              d="M20 12H4"
            />
          </svg>
        </button>

        <p className="mx-20 text-black text-2xl">{count}</p>

        <button
            className="flex items-center justify-center w-7 h-12"
            onClick={incrementCount}
          >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 text-black mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="4"
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
      </div>
      </>
    )
  };

  return (
    <main id="main" className="py-16 bg-pattern">
      <div className="container mx-auto flex flex-col items-center pt-4">

        <Toaster
          position="top-center"
          reverseOrder={false}
        />
        
        <div className="flex flex-col items-center rounded-3xl" style={{backgroundColor: '#b1fcf2', width: '400px', padding: '40px'}}>
          <div style={{marginTop: '-90px'}}>
            <img src="/images/head.png" width={100} /> 
          </div>
          {loadingPage ? <img src="/images/loading.gif" width={65} /> : <>
            {parseInt(totalSupply) == parseInt(maxSupply) ? (
            <>
              <p className="text-white text-2xl mt-8">
                {" "}
                Fun Frens is sold out, you can 
                {" "}
                <a
                  target={""}
                  href={"https://opensea.io/collection/collection-name"}
                >
                  view collection on Opensea
                </a>
              </p>
            </>
            ) : (
            <>
              {isSaleActive ? (
                <>
                  <h5 className="text-3xl mt-5" style={{marginBottom: '-5px', color: '#1cc37f'}}>Total Minted:</h5>
                  <p className="text-white text-6xl mb-5">
                    <span style={{verticalAlign: 'middle', color: '#003931'}} className="text-center">{totalSupply} / {parseFloat(maxSupply).toLocaleString('en')}</span> 
                  </p>

                  {walletAddress.length > 0 ? (
                    <></>
                    ) : (
                    <>
                      <button
                        style={{borderRadius: 15, backgroundColor: '#1cc37f'}}
                        className="mt-6 py-3 px-14 text-4xl text-center text-white uppercase rounded"
                        onClick={connectWalletPressed}
                      >
                        CONNECT
                      </button>
                    </>
                  )}

                  {(() => {
                    if(walletAddress !== ""){
                      if (isWhiteList && whitelistValid) {
                        if(parseInt(totalSupply) < parseInt(maxNoFreeNft)){
                          if(parseInt(noForAddrWl) < parseInt(noFreeNft)){
                            return(
                              <>
                                <h5 className="text-xl mt-5" style={{marginBottom: '-20px', color: '#1cc37f'}}>Mint Quantity:</h5>
                                {mintSectionCount()}
                                {loading ? 
                                  <img style={{marginTop: '30px'}} src="/images/loading.gif" width={40} />
                                  :
                                  <button
                                    style={{backgroundColor: '#1cc37f'}}
                                    className="text-2xl mt-5 py-2 px-4 text-center text-white uppercase border-2 border-black rounded-full"
                                    onClick={mintWl}
                                  >
                                    Mint (Free)
                                  </button>
                                }
                              </>
                            )
                          }
                          else{
                            return(
                              <>
                                <h4 style={{color: '#003931'}} className="mt-2 text-center text-2xl">{`You've minted your free Floaties!`}</h4>
                              </>
                            )
                          }
                        }
                        else{
                          if(parseInt(noForAddrWl) < parseInt(noWLNft)){
                            return(
                              <>
                              {/* <h4 className="text-white font-extrabold mb-2 text-2xl">WHITELIST SALE</h4> */}
                              <h4 style={{color: '#003931'}} className="mt-2 text-center text-2xl">{`You've minted ${noForAddrWl}/${noWLNft} Floaties!`}</h4>
                              <h5 className="text-xl mt-5" style={{marginBottom: '-20px', color: '#1cc37f'}}>Mint Quantity:</h5>
                              {mintSectionCount()}
                              {loading ? 
                                <img style={{marginTop: '30px'}} src="/images/loading.gif" width={40} />
                                :
                                <button
                                  style={{backgroundColor: '#1cc37f'}}
                                  className="text-2xl mt-5 py-2 px-4 text-center text-white uppercase border-2 border-black rounded-full"
                                  onClick={mintWl}
                                >
                                  Mint ({Number.parseFloat(nftPrice * count).toFixed(3)}{' '} ETH{''})
                                </button>
                              }
                              </>
                            )
                          }else{
                            return(
                              <>
                                <h4 style={{color: '#003931'}} className="mt-2 text-center text-2xl">{`You've minted ${noForAddrWl}/${noWLNft} Floaties!`}</h4>
                              </>
                            )
                          }
                        }
                      } else if (isWhiteList && !whitelistValid) {
                        return (
                            <>
                              <h4 style={{color: '#003931'}} className="mt-2 text-center text-2xl">Sorry, you&#8242;re not whitelisted!</h4>
                            </>
                        )
                      } else {
                        return (
                          <>
                            {/* <h4 className="text-white font-extrabold mb-2 text-2xl">PUBLIC SALE</h4> */}
                            <h5 className="text-xl mt-5" style={{marginBottom: '-20px', color: '#1cc37f'}}>Mint Quantity:</h5>
                            {mintSectionCount()}
                            {loading ? 
                              <img style={{marginTop: '30px'}} src="/images/loading.gif" width={40} />
                              :
                              <button
                                style={{backgroundColor: '#1cc37f'}}
                                className="text-2xl mt-5 py-2 px-4 text-center text-white uppercase border-2 border-black rounded-full"
                                onClick={mintP}
                              >
                                Mint ({Number.parseFloat(nftPrice * count).toFixed(3)}{' '} ETH{''})
                              </button>
                            }
                          </>
                        )
                      }
                    }
                  })()}

                  {/* {mintSection()} */}
                </>
              ) : (
                <p style={{color: '#003931'}} className="mt-2 text-center text-3xl">
                  {" "}
                  Mint Not Started yet
                </p>
              )}
            </>
            )}
          </>}
        </div>
      </div>
    </main>
  );
};

export default Hero;