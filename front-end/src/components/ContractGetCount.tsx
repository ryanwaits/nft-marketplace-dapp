"use client";

import React, { useState } from "react";
import { getApi } from '@/lib/stacks-api';
import { ReadOnlyFunctionSuccessResponse } from '@stacks/blockchain-api-client';
import { CONTRACTS } from "@/constants/contracts";
import { DEVNET_STACKS_BLOCKCHAIN_API_URL } from "@/constants/devnet";
import {
  cvToHex,
  cvToString,
  hexToCV,
  standardPrincipalCV,
} from "@stacks/transactions";

const DEVNET_ADDRESS = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";
const ContractGetCount = () => {
  const [count, setCount] = useState<string | null>(null);


  async function getCount() {
    try {
      const api = getApi(DEVNET_STACKS_BLOCKCHAIN_API_URL);
      const response = await api.smartContractsApi.callReadOnlyFunction({
        contractAddress: CONTRACTS.COUNTER.ADDRESS,
        contractName: CONTRACTS.COUNTER.NAME,
        functionName: "get-count",
        readOnlyFunctionArgs: {
          sender: DEVNET_ADDRESS,
          arguments: [cvToHex(standardPrincipalCV(DEVNET_ADDRESS))],
        },
      });

      if ((response as ReadOnlyFunctionSuccessResponse).okay) {
        const result = (response as ReadOnlyFunctionSuccessResponse).result;
        console.log("Response:", result);
        if (result) {
          setCount(cvToString(hexToCV(result)));
        }
      }
    } catch (error) {
      console.error("Error fetching count:", error);
    }
  }

  // if (!isWalletConnected) {
  //   return null;
  // }

  return (
    <div className="Container">
      <h3>Your Current Count</h3>
      <button className="GetCount" onClick={getCount}>
        Get Count
      </button>
      {count !== null && <p>Your count is: {count}</p>}
    </div>
  );
};

export default ContractGetCount; 