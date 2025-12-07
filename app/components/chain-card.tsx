import { Button } from "@/components/ui/button";
import Image from "next/image";

export function ChainCard() {
  const chainList = [
    {
      chainName: "Ethereum",
      image: "/mainnet-network.webp",
    },
    {
      chainName: "BNB Smart Chain",
      image: "/bsc-network.webp",
    },
  ];

  return (
    <div>
      {chainList.map((chain) => (
        <Button
          key={chain.chainName}
          className="p-3 mx-5 cursor-pointer"
          variant="outline"
        >
          <Image width={20} height={20} src={chain.image} alt="account-perch" />
          {chain.chainName}
        </Button>
      ))}
    </div>
  );
}
