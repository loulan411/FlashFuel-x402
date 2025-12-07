"use client";
import { useState } from "react";
import { Header } from "@/components/Header";
import Image from "next/image";
import usdc from "@/public/usdc.webp";
import { ChainCard } from "@/components/chain-card";
import { usePaywalledFetch } from "@/hooks/usePaywalledFetch";
import { useSolana } from "@/components/solana-provider";

export default function Home() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const paywalledFetch = usePaywalledFetch();
  const { isConnected, selectedWallet } = useSolana();

  function handleCardClick(amount: number) {
    setSelectedAmount(amount);
  }
  console.log("paywalledFetch", paywalledFetch);
  async function handleConfirm() {
    console.log("handleConfirm", selectedAmount, paywalledFetch);
    if (!selectedAmount || !paywalledFetch) {
      console.error("请先选择金额或连接钱包");
      return;
    }

    setIsLoading(true);
    try {
      // 调用 paywalled fetch，这里需要根据实际 API 端点调整
      const response = await paywalledFetch("/endpoint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: selectedAmount }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("支付成功:", data);
        alert(`支付成功！金额: ${selectedAmount} USDT`);
      } else {
        throw new Error("支付失败");
      }
    } catch (error) {
      console.error("支付错误:", error);
      alert("支付失败，请重试");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full">
      <Header />

      <div className="px-5 w-[90%] h-16 mx-auto mt-10">
        {/*<div className="bg-[#171717] w-full h-[100px]"></div>*/}

        {/* <div className="w-full h-[112px] bg-[url(/solana-bg.1324147f.png)] bg-cover"></div> */}
        <ChainCard />
        <div className="w-full mt-5">
          <div className="flex flex-col gap-5 items-center">
            {[
              { amount: 5, eth: "0.00165" },
              { amount: 10, eth: "0.0033" },
              { amount: 20, eth: "0.0066" },
            ].map((item) => (
              <div
                key={item.amount}
                onClick={() => handleCardClick(item.amount)}
                className={`group w-[500px] p-5 rounded-2xl bg-gradient-to-r from-amber-50 to-yellow-50 border flex items-center cursor-pointer hover:shadow-lg hover:shadow-amber-200/50 hover:scale-[1.02] transition-all duration-300 ${
                  selectedAmount === item.amount
                    ? "border-amber-400 shadow-lg shadow-amber-200/50 ring-2 ring-amber-300"
                    : "border-amber-200/50 hover:border-amber-300"
                }`}
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-yellow-400 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                  <Image width={28} height={28} src={usdc} alt="usdc-icon" className="rounded-full" />
                </div>
                <div className="ml-5 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-semibold text-gray-800">
                      {item.amount} USDT
                    </span>
                    <span className="text-gray-500">~=</span>
                    <span className="text-lg font-semibold text-amber-600">
                      {item.eth} ETH
                    </span>
                  </div>
                </div>
                <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg
                    className="w-5 h-5 text-amber-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            ))}
          </div>
          
          {!isConnected && (
            <div className="mt-8 flex justify-center">
              <div className="px-6 py-3 rounded-xl bg-yellow-100 border border-yellow-300 text-yellow-800">
                ⚠️ 请先连接钱包才能进行支付
              </div>
            </div>
          )}
          
          {selectedAmount && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={handleConfirm}
                disabled={isLoading || !paywalledFetch}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-semibold text-lg shadow-lg hover:shadow-xl hover:from-amber-600 hover:to-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    处理中...
                  </span>
                ) : (
                  `确认支付 ${selectedAmount} USDT`
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
