import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getDefaultConfig, RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { WagmiProvider, useAccount } from 'wagmi';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectButton } from '@rainbow-me/rainbowkit';
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
    <div className="terminal-v1-1" style={{backgroundImage: `linear-gradient(rgba(0,0,0,0.9), rgba(0,0,0,0.9)), url(${fundoImg})`}}>
      <header className="main-nav">
        <div className="brand"><img src={logoImg} alt="logo" /></div>
        <div className="terminal-id">NEURA PRO TERMINAL v1.1</div>
        <div className="auth-area"><ConnectButton label="CONNECT" /></div>
      </header>

      <div className="content-container">
        {/* ESQUERDA */}
        <div className="side-col">
          <div className="glass-panel">
            <h2 className="label-tag">SWAP ENGINE</h2>
            <div className="swap-logic">
              <label className="min-label">ORIGIN</label>
              <select className="ui-field"><option>ANKR</option></select>
              <input type="number" className="ui-field" placeholder="0.00" value={swapAmount} onChange={e => setSwapAmount(e.target.value)} />
              <div className="ui-arrow">⇅</div>
              <label className="min-label">DESTINATION</label>
              <select className="ui-field"><option>BTC</option></select>
              <div className="ui-readonly">{swapAmount ? (swapAmount * 0.00000004).toFixed(8) : "0.0000"}</div>
              <button className="neon-btn">EXECUTE</button>
            </div>
          </div>
          <div className="glass-panel">
            <h2 className="label-tag">TRANSFER</h2>
            <input className="ui-field" placeholder="Qty..." />
            <input className="ui-field" placeholder="0x..." />
            <button className="neon-btn">SEND</button>
          </div>
        </div>

        {/* CENTRO */}
        <div className="center-col">
          <div className="asset-bar">
            <span className="min-label">ASSET:</span>
            <select className="asset-select" value={selectedAsset.symbol} onChange={(e) => setSelectedAsset(ASSETS_LIST.find(a => a.symbol === e.target.value))}>
              {ASSETS_LIST.map(a => (
                <option key={a.symbol} value={a.symbol}>{a.symbol} - ${prices[a.id]?.usd || '0.00'}</option>
              ))}
            </select>
            <div className="asset-status">LIVE: <span className="neon">{selectedAsset.symbol}</span></div>
          </div>
          <div className="chart-wrapper">
            <iframe 
              src={`https://s.tradingview.com/widgetembed/?symbol=${selectedAsset.pair}&interval=D&theme=dark`} 
              width="100%" height="100%" frameBorder="0" title="tv"
            ></iframe>
          </div>
        </div>

        {/* DIREITA */}
        <div className="side-col">
          <div className="glass-panel">
            <h2 className="label-tag">WALLET</h2>
            <div className="wallet-info">
              <div className="small-txt">{isConnected ? `${address.slice(0,6)}...${address.slice(-4)}` : 'DISCONNECTED'}</div>
              <div className="neon">ANKR: 1,250.00</div>
            </div>
          </div>
          <div className="glass-panel flex-grow">
            <h2 className="label-tag">COLLECTIONS</h2>
            <div className="empty-msg">NO DATA</div>
          </div>
          <div className="glass-panel">
            <h2 className="label-tag">MONITOR</h2>
            <img src={animationGif} alt="monitor" className="mon-gif" />
            <div className="mon-time">{time}</div>
          </div>
        </div>
      </div>

      <footer className="footer-ticker">
        <div className="ticker-scroll">
          {ASSETS_LIST.concat(ASSETS_LIST).map((a, i) => (
            <span key={i} className="ticker-box">{a.symbol}: <span className="neon">${prices[a.id]?.usd?.toFixed(2) || '0.00'}</span></span>
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
