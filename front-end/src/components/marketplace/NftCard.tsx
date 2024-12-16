"use client";

import {
  CardFooter,
  Heading,
  Stack,
  CardBody,
  Card,
  Text,
  Image,
  Box,
  Input,
  Button,
  HStack,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { formatContractName } from "@/utils/formatting";
import { getPlaceholderImage } from "@/utils/nft-utils";
import { useState } from "react";
import { openContractCall } from "@stacks/connect";
import { listAsset } from "@/lib/marketplace/operations";
import { shouldUseDirectCall, executeContractCall } from "@/lib/contract-utils";
import { storeTxid } from "@/utils/localStorageUtils";
import { useDevnetWallet } from "@/lib/devnet-wallet-context";
import { useRouter } from "next/navigation";

interface NftCardProps {
  nft: {
    nftAssetContract: string;
    tokenId: number;
  };
}

export const NftCard = ({ nft }: NftCardProps) => {
  const { nftAssetContract, tokenId } = nft;
  const contractName = formatContractName(nftAssetContract);
  const [price, setPrice] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const router = useRouter();
  const { currentWallet } = useDevnetWallet();

  const handleList = async () => {
    if (!price) {
      toast({
        title: "Error",
        description: "Please enter a price",
        status: "error",
      });
      return;
    }

    setIsLoading(true);
    try {
      const [contractAddress, contractName] = nftAssetContract.split(".");
      const txOptions = await listAsset({
        nftContractAddress: contractAddress,
        nftContractName: contractName,
        tokenId: tokenId,
        price: Number(price),
        expiry: 1000000000,
      });
      console.log("txOptions", txOptions);

      if (shouldUseDirectCall(currentWallet)) {
        const { txid } = await executeContractCall(txOptions, currentWallet);
        storeTxid(txid);
        toast({
          title: "NFT Listed",
          description: `Transaction broadcast with ID: ${txid}`,
          status: "success",
          duration: 3000,
        });
        router.push("/");
        return;
      }

      await openContractCall({
        ...txOptions,
        onFinish: (data) => {
          toast({
            title: "Success",
            description: "Listing created successfully!",
            status: "success",
            duration: 3000,
          });
          router.push("/");
        },
        onCancel: () => {
          toast({
            title: "Cancelled",
            description: "Transaction was cancelled",
            status: "info",
          });
        },
      });
    } catch (e) {
      console.error(e);
      toast({
        title: "Error",
        description: "Failed to create listing",
        status: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <VStack spacing={4} align="stretch">
      <Card
        maxW="sm"
        cursor="pointer"
        transition="transform 0.2s"
        _hover={{ transform: "scale(1.02)" }}
        overflow="hidden"
        boxShadow="lg"
      >
        <CardBody padding={0}>
          <Box aspectRatio={1} overflow="hidden">
            <Image
              src={getPlaceholderImage(tokenId)}
              alt={`NFT #${tokenId}`}
              width="100%"
              height="100%"
              objectFit="cover"
            />
          </Box>
          <Stack spacing={2} p={4}>
            <Heading size="md">NFT #{tokenId}</Heading>
            <Text fontSize="sm" color="gray.500">
              {contractName}
            </Text>
          </Stack>
        </CardBody>
        <CardFooter pt={0} px={4} pb={4}>
          <Text fontSize="xs" color="gray.400" isTruncated>
            {nftAssetContract}
          </Text>
        </CardFooter>
      </Card>
      <HStack>
        <Input
          placeholder="Price in STX"
          type="number"
          min={0}
          step={0.1}
          flex={1}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <Button
          colorScheme="orange"
          onClick={handleList}
          isLoading={isLoading}
          loadingText="Listing..."
        >
          List
        </Button>
      </HStack>
    </VStack>
  );
};
