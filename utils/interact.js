const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const web3 = createAlchemyWeb3(process.env.NEXT_PUBLIC_API_URL);

const { MerkleTree } = require('merkletreejs')
const keccak256 = require('keccak256')
const whitelist = require('./whitelist.json')

const contract = require("./abi.json");
const contractAddress = "0x8Cd3F2E8591D56FFEa9B4A4847e368EbbeAF0e4D";
const nftContract = new web3.eth.Contract(contract, contractAddress);

const leafNodes1 = whitelist.map((addr) => keccak256(addr))
const merkleTreeWL = new MerkleTree(leafNodes1, keccak256, { sortPairs: true })
const rootWL = merkleTreeWL.getRoot()

let response = {
  success: false,
  status: ""
};

export const connectWallet = async () => {
  if (window.ethereum) {
    try {
      const addressArray = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const obj = {
        status: "",
        address: addressArray[0],
      };

      return obj;
    } catch (err) {
      return {
        address: "",
        status: err.message,
      };
    }
  } else {
    return {
      address: "",
      status: "You must install MetaMask, a virtual Ethereum wallet, in your browser"
    };
  }
};

export const getCurrentWalletConnected = async () => {
  if (window.ethereum) {
    try {
      const addressArray = await window.ethereum.request({
        method: "eth_accounts",
      });

      if (addressArray.length > 0) {
        return {
          address: addressArray[0],
          status: "",
        };
      } else {
        return {
          address: "",
          status: "connect your wallet",
        };
      }
    } catch (err) {
      return {
        address: "",
        status: err.message,
      };
    }
  } else {
    return {
      address: "",
      status: "You must install MetaMask, a virtual Ethereum wallet, in your browser"
    };
  }
};

// Contract Methods
const getMaxSupply = async () => {
  const result = nftContract.methods.maxSupply().call();
  return result;
}

const checkOnlyWhitelist = async () => {
  const result = nftContract.methods.whitelistMintEnabled().call();
  return result;
};

export const getTotalSupply = async () => {
  const result = await nftContract.methods.totalSupply().call();
  return result;
};

const getNftPrice = async () => {
  const result = await nftContract.methods.cost().call();
  const resultEther = web3.utils.fromWei(result, "ether");
  return resultEther;
};

export const getSaleState = async () => {
  const result = await nftContract.methods.paused().call();
  return !result;
};

export const getNoWLNft = async () => {
  const result = await nftContract.methods.maxMintAmountPerTxWL().call();
  return result;
};

export const getNoFreeNft = async () => {
  const result = await nftContract.methods.maxMintAmountPerTxWLFree().call();
  return result;
};

const getMaxNoFreeNft = async () => {
  const result = await nftContract.methods.noFreeNft().call();
  return result;
};

const getBalnceOFwl = async (_address) => {
  const result = await nftContract.methods.whitelistClaimed(_address).call();
  return result;
};

export const getMaxMintPerTx = async () => {
  const result = await nftContract.methods.maxMintAmountPerTx().call();
  return result;
};

export const mintWhiteList = async (mintAmount) => {
  
  if (!window.ethereum.selectedAddress) {
    response.success = false;
    response.status = 'Connect to Metamask using Connect Wallet Button';
    return response;
  }

  const leaf = keccak256(window.ethereum.selectedAddress)
  const proof = merkleTreeWL.getHexProof(leaf)
  // Verify WL Merkle Proof
  const isValidWL = merkleTreeWL.verify(proof, leaf, rootWL)

  if (!isValidWL) {
    response.success = false;
    response.status = 'This Wallet Address Is not on the Whitelist for Presale';
    return response;
  }

  const resultEther = await nftContract.methods.cost().call();
  const freeToMint = parseInt(await getMaxNoFreeNft());
  const currentSupply = parseInt(await getTotalSupply());

  await nftContract.methods.whitelistMint(mintAmount, proof)
  .send({
      from: window.ethereum.selectedAddress,
      to: contractAddress,
      value: (currentSupply + mintAmount) > freeToMint ? resultEther * mintAmount : 0,
  })
  .then(function(receipt){
      console.log("receipt", receipt);
      response.success = true;
      response.status = "Minted successfully";
  })
  .catch(function(error){
      console.log("error: ", error);
      response.success = false;
      response.status = 'Something went wrong';
  });

  return response;

}

export const mintPublic = async (mintAmount) => {
  if (!window.ethereum.selectedAddress) {
    response.success = false;
    response.status = 'Connect to Metamask using Connect Wallet Button';
    return response;
  }

  const resultEther = await nftContract.methods.cost().call();

  await nftContract.methods.mint(mintAmount)
    .send({
        from: window.ethereum.selectedAddress,
        to: contractAddress,
        value: resultEther * mintAmount,
    })
    .then(function(receipt){
      console.log("receipt", receipt);
      response.success = true;
      response.status = "Minted successfully";
    })
    .catch(function(error){
        console.log("error: ", error);
        response.success = false;
        response.status = 'Something went wrong';
    });

  return response;
}

export {nftContract, getMaxNoFreeNft, getNftPrice, checkOnlyWhitelist, getMaxSupply, getBalnceOFwl};