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
  { symbol: 'USDC', id: 'usd-coin', pair: 'BINANCE:USDCUSDT' },
  { symbol: 'USDT', id: 'tether', pair: 'BINANCE:USDTUSDT' },
  { symbol: 'BTC', id: 'bitcoin', pair: 'BITSTAMP:BTCUSD' },
  { symbol: 'ETH', id: 'ethereum', pair: 'BITSTAMP:ETHUSD' },
  { symbol: 'SOL', id: 'solana', pair: 'BINANCE:SOLUSDT' },
  { symbol: 'HYPE', id: 'hyperliquid', pair: 'BYBIT:HYPEUSDT' },
  { symbol: 'SUI', id: 'sui', pair: 'BINANCE:SUIUSDT' },
  { symbol: 'AVAX', id: 'avalanche-2', pair: 'BINANCE:AVAXUSDT' },
  { symbol: 'XRP', id: 'ripple', pair: 'BINANCE:XRPUSDT' }
];

function WalletInterface() {
  const { address, isConnected } = useAccount();
  const [selectedChartAsset, setSelectedChartAsset] = useState(ASSETS_LIST[0]);
  const [prices, setPrices] = useState({});
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  const [swapOrigin, setSwapOrigin] = useState(ASSETS_LIST[0]); 
  const [swapDest, setSwapDest] = useState(ASSETS_LIST[1]); 
  const [swapAmount, setSwapAmount] = useState('');

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
    const priceTimer = setInterval(fetchPrices, 30000);
    return () => { clearInterval(timer); clearInterval(priceTimer); };
  }, []);

  const getInputValueInUSD = () => {
    if (!swapAmount || !prices[swapOrigin.id]) return "0.00";
    return (swapAmount * prices[swapOrigin.id].usd).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const getEstimatedReturn = () => {
    if (!swapAmount || !prices[swapOrigin.id] || !prices[swapDest.id]) return "0.000000";
    const totalUSD = swapAmount * prices[swapOrigin.id].usd;
    return (totalUSD / prices[swapDest.id].usd).toFixed(6);
  };

  return (
    <div className="app-viewport" style={{backgroundImage: `linear-gradient(rgba(0,0,0,0.9), rgba(0,0,0,0.9)), url(${fundoImg})`}}>
      <header className="terminal-header">
        <div className="brand-box"><img src={logoImg} alt="logo" /></div>
        <div className="header-title">NEURA PRO TERMINAL v1.1</div>
        <div className="header-wallet"><ConnectButton label="CONNECT" /></div>
      </header>

      <main className="terminal-main">
        <aside className="column left">
          <section className="panel swap-section">
            <h3 className="panel-label">SWAP ENGINE</h3>
            <div className="swap-content">
              <div className="field-box">
                <div className="field-header">
                  <label className="min-label">FROM</label>
                  <span className="balance-label">${getInputValueInUSD()}</span>
                </div>
                <div className="input-group-row">
                  <select className="input-tiny sel-mini" value={swapOrigin.symbol} onChange={(e) => setSwapOrigin(ASSETS_LIST.find(a => a.symbol === e.target.value))}>
                    {ASSETS_LIST.map(a => <option key={a.symbol} value={a.symbol}>{a.symbol}</option>)}
                  </select>
                  <input type="number" className="input-tiny main-val" placeholder="0.00" value={swapAmount} onChange={e => setSwapAmount(e.target.value)} />
                </div>
              </div>
              
              <div className="swap-divider-small" onClick={() => { const t = swapOrigin; setSwapOrigin(swapDest); setSwapDest(t); }}>⇅</div>
              
              <div className="field-box">
                <div className="field-header"><label className="min-label">TO</label></div>
                <div className="input-group-row">
                  <select className="input-tiny sel-mini" value={swapDest.symbol} onChange={(e) => setSwapDest(ASSETS_LIST.find(a => a.symbol === e.target.value))}>
                    {ASSETS_LIST.map(a => <option key={a.symbol} value={a.symbol}>{a.symbol}</option>)}
                  </select>
                  <div className="readonly-box-compact">{getEstimatedReturn()}</div>
                </div>
              </div>
              <button className="btn-neon-compact">EXECUTE SWAP</button>
            </div>
          </section>

          <section className="panel transfer-section">
            <h3 className="panel-label">TRANSFER</h3>
            <input className="input-tiny-mini" placeholder="Qty..." />
            <input className="input-tiny-mini" placeholder="0x..." />
            <button className="btn-neon-compact">SEND</button>
          </section>
        </aside>

        <section className="column center">
          <div className="asset-selector-header-compact">
            <span className="text-dim-mini">CHART:</span>
            <select className="select-asset-main-mini" value={selectedChartAsset.symbol} onChange={(e) => setSelectedChartAsset(ASSETS_LIST.find(a => a.symbol === e.target.value))}>
              {ASSETS_LIST.map(a => (
                <option key={a.symbol} value={a.symbol}>{a.symbol} - ${prices[a.id]?.usd?.toFixed(2) || '0.00'}</option>
              ))}
            </select>
          </div>
          <div className="chart-container-box">
            <iframe src={`https://s.tradingview.com/widgetembed/?symbol=${selectedChartAsset.pair}&interval=D&theme=dark`} width="100%" height="100%" frameBorder="0" title="tv-chart"></iframe>
          </div>
        </section>

        <aside className="column right">
          <section className="panel wallet-section-mini">
            <h3 className="panel-label">WALLET</h3>
            <div className="wallet-row-mini">
              <div className="addr-txt-mini">{isConnected ? `${address.slice(0,4)}...${address.slice(-4)}` : 'OFFLINE'}</div>
              <div className="neon-txt-mini">ANKR: 1,250</div>
            </div>
          </section>
          <section className="panel monitor-section-mini">
            <h3 className="panel-label">MONITOR</h3>
            <img src={animationGif} alt="monitor" className="gif-tiny-mini" />
            <div className="time-txt-mini">{time}</div>
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
