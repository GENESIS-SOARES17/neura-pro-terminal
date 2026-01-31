import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getDefaultConfig, RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { WagmiProvider, useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { parseEther } from 'viem';
import '@rainbow-me/rainbowkit/styles.css';
import './App.css';

// Assets
import fundoImg from './assets/fundo.jpg';
import logoImg from './assets/logo.png';
import animationGif from './assets/animation.gif'; 

const neuraTestnet = {
  id: 267,
  name: 'Neura Testnet',
  nativeCurrency: { name: 'ANKR', symbol: 'ANKR', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.ankr.com/neura_testnet'] } },
};

const config = getDefaultConfig({
  appName: 'NEURA PRO TERMINAL',
  projectId: '93466144e0b04323c2a106d8601420d4',
  chains: [neuraTestnet],
});

const queryClient = new QueryClient();

// Lista completa para preencher a barra superior (conforme suas fotos)
const ASSETS = [
  { symbol: 'ANKR', id: 'ankr', pair: 'BINANCE:ANKRUSDT' },
  { symbol: 'BTC', id: 'bitcoin', pair: 'BITSTAMP:BTCUSD' },
  { symbol: 'ETH', id: 'ethereum', pair: 'BITSTAMP:ETHUSD' },
  { symbol: 'SOL', id: 'solana', pair: 'BINANCE:SOLUSDT' },
  { symbol: 'HYPE', id: 'hyperliquid', pair: 'BYBIT:HYPEUSDT' },
  { symbol: 'AVAX', id: 'avalanche-2', pair: 'BINANCE:AVAXUSDT' },
  { symbol: 'SUI', id: 'sui', pair: 'BINANCE:SUIUSDT' },
  { symbol: 'JUP', id: 'jupiter-exchange-solana', pair: 'BINANCE:JUPUSDT' },
  { symbol: 'XLM', id: 'stellar', pair: 'BINANCE:XLMUSDT' },
  { symbol: 'DOT', id: 'polkadot', pair: 'BINANCE:DOTUSDT' },
  { symbol: 'BNB', id: 'binancecoin', pair: 'BINANCE:BNBUSDT' },
  { symbol: 'XRP', id: 'ripple', pair: 'BINANCE:XRPUSDT' },
  { symbol: 'ADA', id: 'cardano', pair: 'BINANCE:ADAUSDT' },
  { symbol: 'TRX', id: 'tron', pair: 'BINANCE:TRXUSDT' },
  { symbol: 'POL', id: 'matic-network', pair: 'BINANCE:POLUSDT' },
  { symbol: 'IMX', id: 'immutable-x', pair: 'BINANCE:IMXUSDT' }
];

function WalletInterface() {
  const { address, isConnected } = useAccount();
  const [chartSymbol, setChartSymbol] = useState('BINANCE:ANKRUSDT');
  const [prices, setPrices] = useState({});
  const [swapAmount, setSwapAmount] = useState('');
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    const fetchPrices = async () => {
      try {
        const ids = ASSETS.map(a => a.id).join(',');
        const res = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`);
        setPrices(res.data);
      } catch (e) { console.error(e); }
    };
    fetchPrices();
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="terminal-wrapper" style={{backgroundImage: `linear-gradient(rgba(0,0,0,0.85), rgba(0,0,0,0.85)), url(${fundoImg})`}}>
      <div className="crt-lines"></div>
      
      <nav className="header-nav">
        <div className="logo-wrap"><img src={logoImg} alt="logo" /></div>
        <div className="title-glow">NEURA PRO TERMINAL v1.1</div>
        <div className="wallet-wrap"><ConnectButton label="CONNECT" /></div>
      </nav>

      <div className="main-layout">
        {/* LADO ESQUERDO */}
        <aside className="column-side">
          <section className="glass-box swap-container">
            <h2 className="box-label">SWAP ENGINE</h2>
            <div className="swap-fields">
              <div className="field-group">
                <label>ORIGIN</label>
                <select className="ui-input-dark"><option>ANKR</option></select>
                <input type="number" className="ui-input-dark" placeholder="0.00" value={swapAmount} onChange={e => setSwapAmount(e.target.value)} />
              </div>
              <div className="swap-divider">⇅</div>
              <div className="field-group">
                <label>DESTINATION</label>
                <select className="ui-input-dark"><option>BTC</option></select>
                <div className="ui-result-box">{swapAmount ? (swapAmount * 0.00000004).toFixed(8) : "0.00000000"}</div>
              </div>
              <button className="neon-btn-action">EXECUTE SWAP</button>
            </div>
          </section>

          <section className="glass-box">
            <h2 className="box-label">TRANSFER</h2>
            <input className="ui-input-dark" placeholder="Amount..." />
            <input className="ui-input-dark" placeholder="Recipient 0x..." />
            <button className="neon-btn-action">SEND ASSETS</button>
          </section>
        </aside>

        {/* CENTRO (GRÁFICO) */}
        <main className="column-center">
          <div className="top-asset-bar">
            {ASSETS.map(a => (
              <button key={a.symbol} onClick={() => setChartSymbol(a.pair)} className={chartSymbol === a.pair ? 'tab-item active' : 'tab-item'}>
                {a.symbol}
              </button>
            ))}
          </div>
          <div className="glass-box chart-area">
            <iframe src={`https://s.tradingview.com/widgetembed/?symbol=${chartSymbol}&interval=D&theme=dark`} width="100%" height="100%" frameBorder="0" title="main-chart"></iframe>
          </div>
        </main>

        {/* LADO DIREITO */}
        <aside className="column-side">
          <section className="glass-box">
