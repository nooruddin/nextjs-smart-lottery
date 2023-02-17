import React, { useEffect, useState } from "react"
import { useMoralis, useWeb3Contract } from "react-moralis"
import { abi, contractAddresses } from "../constants"
import { ethers } from "ethers"
import { useNotification } from "web3uikit"

const LotteryEntrace = () => {
  const [entranceFee, setEntranceFee] = useState("0")
  const [numPlayers, setNumPlayers] = useState("0")
  const [recentWinner, setRecentWinner] = useState("0x")
  const { chainId: chainIdHex, isWeb3Enabled } = useMoralis() // hex value - passed down by MoralisProvider from Header
  const chainId = parseInt(chainIdHex)
  const raffleAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null

  const dispatch = useNotification()
  const {
    runContractFunction: enterRaffle,
    isLoading,
    isFetching,
  } = useWeb3Contract({
    abi,
    contractAddress: raffleAddress,
    functionName: "enterRaffle",
    params: {},
    msgValue: entranceFee,
  })

  const { runContractFunction: getEntranceFee } = useWeb3Contract({
    abi,
    contractAddress: raffleAddress,
    functionName: "getEntranceFee",
    params: {},
  })

  const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
    abi,
    contractAddress: raffleAddress,
    functionName: "getNumberOfPlayers",
    params: {},
  })

  const { runContractFunction: getRecentWinner } = useWeb3Contract({
    abi,
    contractAddress: raffleAddress,
    functionName: "getRecentWinner",
    params: {},
  })

  async function updateUI() {
    const entranceFee = (await getEntranceFee())?.toString()
    const numPlayers = (await getNumberOfPlayers())?.toString()
    const recentWinner = (await getRecentWinner())?.toString()
    setEntranceFee(entranceFee)
    setNumPlayers(numPlayers)
    setRecentWinner(recentWinner)
  }

  useEffect(() => {
    if (isWeb3Enabled) {
      updateUI()
    }
  }, [isWeb3Enabled])

  const handleSuccess = async (tx) => {
    await tx.wait(1)
    handleNewNotification(tx)
    updateUI()
  }

  const handleNewNotification = () => {
    dispatch({
      type: "info",
      message: "Transacation Complete!",
      title: "Tx Notification",
      position: "topR",
      icon: "bell",
    })
  }

  return (
    <>
      <div className="p-5">LotteryEntrace</div>
      {raffleAddress ? (
        <>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-auto"
            onClick={async () => {
              await enterRaffle({
                onSuccess: handleSuccess,
                onError: (error) => console.log(error),
              })
            }}
            disabled={isLoading || isFetching}
          >
            {isLoading || isFetching ? (
              <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
            ) : (
              <div>Enter Raffle</div>
            )}
          </button>
          <h4>Entrace Fee: {ethers.utils.formatUnits(entranceFee, "ether")} ETH</h4>
          <h4>Number of Players: {numPlayers} </h4>
          <h4>Recent Winner: {recentWinner}</h4>
        </>
      ) : (
        <div>No Raffle Address Detected!</div>
      )}
    </>
  )
}

export default LotteryEntrace
