// hooks/usePaywalledFetch.ts
"use client";

import { useMemo } from "react";
import { PublicKey, Connection } from "@solana/web3.js";
import { createPaymentHandler as solanaHandler } from "@faremeter/payment-solana/exact";
import { wrap } from "@faremeter/fetch";
import { useSolana } from "@/components/solana-provider";
import { useWalletAccountTransactionSendingSigner } from "@solana/react";

const RUST_BACKEND_URL = "http://localhost:8080/api/v1";

// (这个 Hook 解决了您提出的所有问题)
export const usePaywalledFetch = () => {
  // 从您的 Hook 中获取核心依赖
  const { selectedAccount, selectedWallet, rpc, chain } = useSolana();
  
  // 使用 @solana/react 提供的 hook 获取签名器
  // Hook 必须在顶层调用，所以即使 selectedAccount 可能为 null 也要调用
  // hook 内部会处理 null 的情况
  const signer = useWalletAccountTransactionSendingSigner(
    selectedAccount as any, // 类型断言，hook 内部会处理 null
    chain
  );

  const paywalledFetch = useMemo(() => {
    // 调试信息
    console.log("usePaywalledFetch - selectedAccount:", selectedAccount);
    console.log("usePaywalledFetch - selectedWallet:", selectedWallet);
    console.log("usePaywalledFetch - signer:", signer);
    
    if (!selectedAccount || !selectedWallet) {
      console.warn("usePaywalledFetch - 钱包未连接");
      return null;
    }

    if (!signer) {
      console.warn("usePaywalledFetch - 无法获取签名器，请确保钱包已连接");
      return null;
    }

    // 1. 获取公钥
    const publicKey = new PublicKey(selectedAccount.address);
    console.log("usePaywalledFetch - publicKey:", publicKey.toString());
    
    // 2. 检查 signer 的结构
    // signer 可能有一个 signAndSendTransactions 方法（复数）
    console.log("usePaywalledFetch - signer 对象键:", signer ? Object.keys(signer) : "null");
    
    if (!signer) {
      console.warn("usePaywalledFetch - signer 为 null");
      return null;
    }

    // 根据 chain 确定 RPC 端点并创建 Connection 对象
    const network = chain.split(":")[1] || "mainnet-beta";
    const rpcEndpoint = 
      network === "devnet" 
        ? "https://api.devnet.solana.com"
        : network === "testnet"
        ? "https://api.testnet.solana.com"
        : "https://api.mainnet-beta.solana.com";
    const connection = new Connection(rpcEndpoint, "confirmed");

    // 3. 构造 @faremeter/payment-solana 需要的钱包接口
    // 根据 @faremeter/payment-solana 的文档，sendTransaction 应该接受一个交易对象
    // 并返回 Promise<Signature>
    // 我们需要从 signer 中提取或包装发送交易的方法
    const sendTransaction = async (transaction: any) => {
      // 如果 signer 有 signAndSendTransactions 方法（复数），使用它
      if (typeof (signer as any).signAndSendTransactions === "function") {
        const result = await (signer as any).signAndSendTransactions([transaction]);
        // 返回第一个签名的结果
        return result[0];
      }
      // 如果 signer 有 sendTransaction 方法，直接使用
      else if (typeof (signer as any).sendTransaction === "function") {
        return await (signer as any).sendTransaction(transaction);
      }
      // 否则抛出错误
      else {
        throw new Error("signer 不支持发送交易");
      }
    };

    const walletInterface = {
      network,
      publicKey,
      sendTransaction,
    };

    // 4. 初始化 Handler（这里的 solanaHandler 已经是同步的）
    const handler = solanaHandler(
      walletInterface,
      // USDC Mint (硬编码用于演示)
      new PublicKey("EPjFWdd5AufqSSxteq1sWAAXzbzM6dot2A3Yq5MsE4aZ"),
      connection,
    );

    // 5. 封装 fetch
    // 创建包装函数以匹配 phase1Fetch 的类型签名
    const phase1Fetch = (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const url = typeof input === "string" 
        ? new URL(input, RUST_BACKEND_URL)
        : input instanceof URL
        ? new URL(input.pathname + input.search, RUST_BACKEND_URL)
        : new URL(input.url, RUST_BACKEND_URL);
      return fetch(url, init);
    };

    return wrap(fetch, {
      handlers: [handler],
      payerChooser: async (execers) => execers[0],
      // 确保 phase1Fetch 指向您的 Rust 后端 API
      phase1Fetch,
    });
  }, [selectedAccount, selectedWallet, rpc, chain, signer]); // 依赖项包括 signer
  return paywalledFetch;
};
