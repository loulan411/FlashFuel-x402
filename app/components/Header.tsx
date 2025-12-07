"use client"
import { useState } from "react";
import { WalletConnectButton } from "@/components/wallet-connect-button";
import Image from "next/image";
import solanaLogo from "@/public/solana.webp"

export function Header() {
    return (
        <div className="navbar py-3 transition-colors duration-300 border-b border-[rgba(240,228,255,0.12)] bg-[#121212] light:bg-white/95">
            <div className="w-full max-w-[1440px] px-[20px] xl:px-[14px] mx-auto flex items-center justify-between gap-x-5 xl:gap-x-12">
                <div className="flex items-center">
                    <Image
                        width={32}
                        height={32}
                        src={solanaLogo}
                        alt="account-perch"
                    />
                    <div className="text-white font-bold text-2xl ml-3">
                        FlashFule
                    </div>
                </div>
                <div>
                    <WalletConnectButton />
                </div>
            </div>
        </div>
    )
}