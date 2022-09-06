import Head from "next/head";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useStatus } from "../context/statusContext";
import { connectWallet, getCurrentWalletConnected } from "../utils/interact";

const Header = () => {
  const { setStatus } = useStatus();
  const [walletAddress, setWalletAddress] = useState("");
  const [navbarOpen, setNavbarOpen] = useState(false);

  // const connectWalletPressed = async () => {
  //   const walletResponse = await connectWallet();
  //   setWalletAddress(walletResponse.address);
  //   setStatus(walletResponse.status);
  // };

  useEffect(() => {
    const fetchData = async () => {
      const walletResponse = await getCurrentWalletConnected();
      setWalletAddress(walletResponse.address);
      setStatus(walletResponse.status);
    };

    fetchData();
    addWalletListener();
  }, []);

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

  return (
    <>
      <Head>
        <title>Floaties</title>
        <meta name="description" content="7777 floaties" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preload" href="/fonts/FatFrank-Regular.otf" as="font" type="font/opentype" crossOrigin="anonymous"></link>
      </Head>

      <nav className="relative flex flex-wrap items-center justify-between px-0 py-3 mb-3">
        <div className="container px-0 mx-auto flex flex-wrap items-center justify-between">
          <div className="w-full relative flex justify-between lg:w-auto lg:static lg:block lg:justify-start">
            {/* Logo */}
            <Link href="#">
              <img src="/images/logo.png" width={130} alt="floaties"/>
            </Link>
            <button
              className="text-white cursor-pointer text-xl leading-none px-3 py-1 border border-solid rounded block lg:hidden outline-none focus:outline-none"
              type="button"
              onClick={() => setNavbarOpen(!navbarOpen)}
            >
              <svg className="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"></path></svg>
            </button>
          </div>
          <div
            className={
              "lg:flex flex-grow" +
              (navbarOpen ? " flex-col" : " hidden")
            }
            
            id="example-navbar-danger"
          >
            <ul className={"flex flex-col lg:flex-row list-none lg:ml-auto items-center"+(navbarOpen ? " space-y-2" : " space-x-2")}>
              {/* Twitter */}
              <li>
                <a href="https://twitter.com/DidemKkkaraasl1" target="_blank" rel="noreferrer">
                  <img src="/images/twitter.png" alt="Twitter" width={30} />
                </a>
              </li>

              {/* Discord */}
              <li>
                <a href="https://discord.gg/rAFdkCwn" target="_blank" rel="noreferrer">
                  <img src="/images/discord.png" alt="Discord" width={30} />
                </a>
              </li>

              {/* Opensea */}
              <li>
                <a href="https://opensea.io" target="_blank" rel="noreferrer">
                  <img src="/images/opensea.png" alt="Opensea" width={30} />
                </a>
              </li>

              {/* Etherscan */}
              <li>
                <a href="https://rinkeby.etherscan.io/token/0x506DA6239A0094Aea2E348f744d1c5dE683d21A2" target="_blank" rel="noreferrer">
                  <img src="/images/etherscan.png" alt="Etherscan" width={30} />
                </a>
              </li>

              {walletAddress.length > 0 ? (<>
                <li className="hover:text-black cursor-pointer px-4 py-1 font-extrabold text-black border-2 border-black bg-white rounded-full">
                  <a
                    className=""
                    id="walletButton"
                  >
                  {String(walletAddress).substring(0,4) +
                  "..." +
                  String(walletAddress).substring(38)}
                  </a>
                </li>
                </>
              ) : 
              <></>}
            </ul>
          </div>
        </div>
      </nav>

    </>
  );
};

export default Header;
