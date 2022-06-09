import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import "./App.css";
import abi from "./utils/WavePortal.json";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import { ThreeDots } from "react-loader-spinner";
import "bootstrap/dist/css/bootstrap.min.css";
import { getAddress } from "ethers/lib/utils";
import { toBeInTheDOM } from "@testing-library/jest-dom";

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [totalWaves, setTotaWaves] = useState(null);
  const [isLoadingWave, setisLoadingWave] = useState(false);
  const [isLoadinAddresses, setIsLoadingAddresses] = useState(false);
  const [addressExists, setAddressExists] = useState(false);
  const [text, setText] = useState("");
  const [textWave, setTextWave] = useState("");
  const [addressError, setAddressError] = useState(false);
  const [allWaves, setAllWaves] = useState([]);
  /**
   * Create a varaible here that holds the contract address after you deploy!
   */
  const contractAddress = "0x42C8A41EaB1497A672E262b59fE1c7CFd0B4601d";
  const contractABI = abi.abi;

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
        getAllWaves();
      } else {
        console.log("No authorized account found");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
      getAllWaves();
    } catch (error) {
      console.log(error);
    }
  };

  const wave = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());

        setTotaWaves(count.toNumber());
        

        const waveTxn = await wavePortalContract.wave(textWave, { gasLimit: 300000 });
        console.log("Mining...", waveTxn.hash);
        setisLoadingWave(true);

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);

        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());

        setTotaWaves(count.toNumber());
        getAllWaves();
        setisLoadingWave(false);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      setisLoadingWave(false);
      console.log(error);
    }
  };

  const getAddressBtn = async () => {
    const address = document.getElementById("addressBtn").value;

    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        // let count = await wavePortalContract.getTotalWaves();
        // console.log("Retrieved total wave count...", count.toNumber());

        // setTotaWaves(count.toNumber());

        setIsLoadingAddresses(true);

        const waveTxn = await wavePortalContract.alreadyExists(address);
        console.log("Check if address already waved: ", waveTxn);

        // await waveTxn.wait();
        // console.log("waveTxn exists ", waveTxn);
        setAddressExists(waveTxn);
        setIsLoadingAddresses(false);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      setAddressExists(false);
      setIsLoadingAddresses(false);
      setAddressError(true);
      console.log(error);
    }
  };

  const handleWaveText = () => {

    const btn = document.getElementById("waveBtn").value;

    if (btn.length > 0) {
      setTextWave(btn);
    } else {
      setTextWave("");
    }

  }

  const handleBtn = () => {

    const btn = document.getElementById("addressBtn").value;

    if (btn.length === 42) {
      setText(btn);
    } else {
      setText("");
    }

  }

    /*
   * Create a method that gets all waves from your contract
   */
    const getAllWaves = async () => {
      const { ethereum } = window;
    
      try {
        if (ethereum) {
          const provider = new ethers.providers.Web3Provider(ethereum);
          const signer = provider.getSigner();
          const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
          const waves = await wavePortalContract.getAllWaves();
    
          const wavesCleaned = waves.map(wave => {
            return {
              address: wave.waver,
              timestamp: new Date(wave.timestamp * 1000),
              message: wave.message,
            };
          });
    
          setAllWaves(wavesCleaned);
        } else {
          console.log("Ethereum object doesn't exist!");
        }
      } catch (error) {
        console.log(error);
      }
    };

    /**
 * Listen in for emitter events!
 */
useEffect(() => {
  let wavePortalContract;
  
  const onNewWave = (from, timestamp, message) => {
    console.log("NewWave", from, timestamp, message);
    setAllWaves(prevState => [
      ...prevState,
      {
        address: from,
        timestamp: new Date(timestamp * 1000),
        message: message,
      },
    ]);
  };
  
  if (window.ethereum) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    
    wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
    wavePortalContract.on("NewWave", onNewWave);
  }
  
  return () => {
    if (wavePortalContract) {
      wavePortalContract.off("NewWave", onNewWave);
    }
  };
}, []);
  // useEffect(() => {
  //   checkIfWalletIsConnected();
  // }, []);

  return (
    <div className="container-fluid">
      <div className="row justify-content-center my-5">
        <div className="col-7 text-center mb-5">👋 Hey there!</div>

        <div className="col-7 text-center">
          I am Simone a Javascript developer on the way to learn Blockchain
          development with Solidity! <br />
          I made this simple application using Solidity with Hardhat for the 
          Smart Contract and React for the Client side. <br /><br />
          For connect your <b>Metamask wallet</b> you have to be connected first to the <b>Rinkeby Testnet</b>.<br />
          This DAPP is a very simple Twitter clone but decentralized where you can
          connect your wallet and post a text message saving it on the Blockchain. <br />
          By posting a message you have a chance to win 0.0001 Ether, there is a 15 min cooldown for consecutive posts.
          <br /><br />
          <b>
            Github: <a href="https://github.com/Simoblaster" target="_blank">Simoblaster</a> <br/> 
            Twitter: <a href="https://twitter.com/simoblaster" target="_blank">@simoblaster</a></b>

        </div>
      </div>
      <div className="row justify-content-center">
        <div className="col-4 mb-5 text-center">
          {!currentAccount && (
            <button className="btn btn-success" onClick={connectWallet}>
              Connect Wallet
            </button>
          )}
        </div>
      </div>
      <div className="row justify-content-center">


        <div className="col-6">
          {/* <div className="row "> */}
            <div className="col-12 mb-3">
              Insert an address to check if already waved!
            </div>
            <div className="col-12 input-group mb-3">
              <input
                id="addressBtn"
                className="form-control"
                placeholder="Address"
                onChange={handleBtn}
              />
              <div className="input-group-append">
                <button
                  disabled={!text}
                  className="btn btn-success"
                  onClick={getAddressBtn}
                >
                  Run
                </button>
              </div>
            </div>
            <div className="col-12">
              {isLoadinAddresses ? (
                <div>
                  <ThreeDots
                    style={{ textAlign: "center" }}
                    height="100"
                    width="100"
                    color="grey"
                    ariaLabel="loading"
                  />
                </div>
              ) : addressExists ? (
                <div>This address already waved :D</div>
              ) : addressError ? (
                <div style={{color: "red"}}>
                  ERROR. Be sure you instert a real existing address or you will
                  recieve an error.
                </div>
              ) : null}
            </div>
          {/* </div> */}
        </div>

        </div>
        <div className="row justify-content-center my-5">

        <div className="col-6">
          {/* <div className="row justify-content-center"> */}

            {isLoadingWave ? (
              <div className="col-12">
                <ThreeDots
                  style={{ textAlign: "center" }}
                  height="100"
                  width="100"
                  color="grey"
                  ariaLabel="loading"
                />
              </div>
            ) : null}

            <div className="col-12">
              <div className="col-12 mb-3">
                Write a message and post it on the application!
              </div>
              <div className="col-12 input-group mb-3">
                <input
                  id="waveBtn"
                  className="form-control"
                  placeholder="Type a message"
                  onChange={handleWaveText}
                />
                <div className="input-group-append">
                  <button
                    disabled={!textWave}
                    className="btn btn-success"
                    onClick={wave}
                  >
                    Wave at Me
                  </button>
                </div>
              </div>
            </div>
          {/* </div> */}
        </div>

      </div>
      <hr />
      <div className="row justify-content-center my-5">
        <h2 className="col-12 my-3 text-center">Messages</h2>
        {allWaves && allWaves.length > 0 ? (
          <div className="col-7 mb-2">
            Messages number: {allWaves.length.toString()}
          </div>
        ) : null}
        {allWaves
          .sort((a, b) => b.timestamp - a.timestamp)
          .map((wave, index) => {
            return (
              <div
                className="col-7"
                key={index}
                style={{
                  backgroundColor: "OldLace",
                  marginTop: "16px",
                  padding: "8px",
                  border: "1px solid black"
                }}
              >
                <div>Address: {wave.address}</div>
                <div>Time: {wave.timestamp.toString()}</div>
                <div>Message: {wave.message}</div>
              </div>
            );
        })}
      </div>
    </div>
  );
};

export default App;
