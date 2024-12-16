"use client";

import { useState, useEffect } from "react";
import { Container, SimpleGrid, VStack, useColorMode, Button, Text, Center } from "@chakra-ui/react";
import { ListingCard } from "@/components/marketplace/ListingCard";
import { fetchListings, Listing } from "@/lib/marketplace/operations";
import { useNftHoldings } from "@/hooks/useNftHoldings";
import { useDevnetWallet } from "@/lib/devnet-wallet-context";

export default function BrowsePage() {
  const { setColorMode } = useColorMode();
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoadingListings, setIsLoadingListings] = useState(true);

  useEffect(() => {
    setColorMode("light");
  }, []);

  // use useNftHoldings to fetch the NFT holdings
  const { currentWallet } = useDevnetWallet();
  const { data: nftHoldings, isLoading: nftHoldingsLoading} = useNftHoldings(
    currentWallet?.stxAddress || ""
  );
  console.log("nftHoldings", nftHoldings);

  const loadListings = async () => {
    setIsLoadingListings(true);
    const fetchedListings = await fetchListings();
    console.log("fetchedListings", fetchedListings);

    // Get the number of txids from localStorage
    // const storedTxidsNumber = localStorage.getItem('txid')
    //   ? Object.keys(JSON.parse(localStorage.getItem('txid')!)).length
    //   : 0;
    // console.log('storedTxids', storedTxidsNumber)

    // // Limit the listings to the number of stored txids
    // const limitedListings = fetchedListings.slice(0, storedTxidsNumber);

    // console.log("Fetched listings:", limitedListings);
    setListings(fetchedListings);
    setIsLoadingListings(false);
  };

  useEffect(() => {
    loadListings();
  }, []);

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        {nftHoldingsLoading || isLoadingListings ? (
          <Center minH="50vh">
            <VStack spacing={4}>
              <Text>Loading NFT holdings and listings...</Text>
              <Button isLoading colorScheme="blue" variant="ghost">
                Loading
              </Button>
            </VStack>
          </Center>
        ) : listings.length > 0 ? (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {listings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onRefresh={loadListings}
              />
            ))}
          </SimpleGrid>
        ) : (
          <Center minH="50vh">
            <VStack spacing={4}>
              <Text fontSize="xl">No NFTs listed yet</Text>
              <Button
                as="a"
                href="/marketplace/list"
                colorScheme="blue"
                size="lg"
                px={8}
              >
                List Your First NFT
              </Button>
            </VStack>
          </Center>
        )}
      </VStack>
    </Container>
  );
}
