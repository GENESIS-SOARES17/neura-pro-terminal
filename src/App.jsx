import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getDefaultConfig, RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { WagmiProvider, useAccount } from 'wagmi';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import './App.css';

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

const ASSETS_LIST = [
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
  const [selectedAsset, setSelectedAsset] = useState(ASSETS_LIST[0]);
  const [prices, setPrices] = useState({});
  const [swapAmount, setSwapAmount] = useState('');
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    const fetchPrices = async () => {
      try {
        const ids = ASSETS_LIST.map(a => a.id).join(',');
        const res = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`);
        setPrices(res.data);
      } catch (e) { console.error(e); }
    };
    fetchPrices();
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="app-viewport" style={{backgroundImage: `linear-gradient(rgba(0,0,0,0.9), rgba(0,0,0,0.9)), url(${fundoImg})`}}>
      <header className="terminal-header">
        <div className="brand-box"><img src={logoImg} alt="logo" /></div>
        <div className="header-title">NEURA PRO TERMINAL v1.1</div>
        <div className="header-wallet"><ConnectButton label="CONNECT" /></div>
      </header>

      <main className="terminal-main">
        {/* LADO ESQUERDO */}
        <aside className="column left">
          <section className="panel swap-section">
            <h3 className="panel-label">SWAP ENGINE</h3>
            <div className="swap-content">
              <div className="field-box">
                <label>FROM</label>
                <select className="input-tiny"><option>ANKR</option></select>
                <input type="number" className="input-tiny" placeholder="0.00" value={swapAmount} onChange={e => setSwapAmount(e.target.value)} />
              </div>
              <div className="swap-divider">⇅</div>
              <div className="field-box">
                <label>TO</label>
                <select className="input-tiny"><option>BTC</option></select>
                <div className="readonly-box">{swapAmount ? (swapAmount * 0.00000004).toFixed(8) : "0.00"}</div>
              </div>
              <button className="btn-neon">EXECUTE</button>
            </div>
          </section>

          <section className="panel transfer-section">
            <h3 className="panel-label">TRANSFER</h3>
            <input className="input-tiny" placeholder="Amount..." />
            <input className="input-tiny" placeholder="Address..." />
            <button className="btn-neon">SEND</button>
          </section>
        </aside>

        {/* CENTRO (GRÁFICO) */}
        <section className="column center">
          <div className="asset-selector-header">
            <span className="text-dim">ASSET:</span>
            <select className="select-asset-main" value={selectedAsset.symbol} onChange={(e) => setSelectedAsset(ASSETS_LIST.find(a => a.symbol === e.target.value))}>
              {ASSETS_LIST.map(a => (
                <option key={a.symbol} value={a.symbol}>{a.symbol} - ${prices[a.id]?.usd || '0.00'}</option>
              ))}
            </select>
          </div>
          <div className="chart-container-box">
            <iframe 
              src={`https://s.tradingview.com/widgetembed/?symbol=${selectedAsset.pair}&interval=D&theme=dark`} 
              width="100%" height="100%" frameBorder="0" title="tv-chart"
            ></iframe>
          </div>
        </section>

        {/* LADO DIREITO */}
        <aside className="column right">
          <section className="panel wallet-section">
            <h3 className="panel-label">WALLET</h3>
            <div className="wallet-row">
              <div className="addr-txt">{isConnected ? `${address.slice(0,6)}...${address.slice(-4)}` : 'DISCONNECTED'}</div>
              <div className="neon-txt">ANKR: 1,250.00</div>
            </div>
          </section>

          <section className="panel collections-section">
            <h3 className="panel-label">COLLECTIONS</h3>
            <div className="empty-center">NO NFTS</div>
          </section>

          <section className="panel monitor-section">
            <h3 className="panel-label">MONITOR</h3>
            <img src={animationGif} alt="monitor" className="gif-tiny" />
            <div className="time-txt">{time}</div>
          </section>
        </aside>
      </main>

      <footer className="terminal-footer">
        <div className="ticker-container">
          {ASSETS_LIST.concat(ASSETS_LIST).map((a, i) => (
            <span key={i} className="ticker-unit">{a.symbol}: <span className="neon-txt">${prices[a.id]?.usd?.toFixed(2) || '0.00'}</span></span>
          ))}
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme({ accentColor: '#adff2f' })}>
          <WalletInterface />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
