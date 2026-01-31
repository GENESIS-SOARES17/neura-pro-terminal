import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Draggable from 'react-draggable';
import { getDefaultConfig, RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { WagmiProvider, useAccount } from 'wagmi';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import './App.css';

// Assets - Certifique-se que os caminhos estão corretos
import logoImg from './assets/logo.png';
import animationGif from './assets/animation.gif'; 

const config = getDefaultConfig({
  appName: 'NEURA WORKSPACE',
  projectId: '93466144e0b04323c2a106d8601420d4',
  chains: [{
    id: 267,
    name: 'Neura Testnet',
    nativeCurrency: { name: 'ANKR', symbol: 'ANKR', decimals: 18 },
    rpcUrls: { default: { http: ['https://rpc.ankr.com/neura_testnet'] } },
  }],
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
  { symbol: 'SUI', id: 'sui', pair: 'BINANCE:SUIUSDT' }
];

function WalletInterface() {
  const { address, isConnected } = useAccount();
  const [prices, setPrices] = useState({});
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  
  // Estados do Swap
  const [swapOrigin, setSwapOrigin] = useState(ASSETS_LIST[0]);
  const [swapDest, setSwapDest] = useState(ASSETS_LIST[1]);
  const [swapAmount, setSwapAmount] = useState('');
  const [chartAsset, setChartAsset] = useState(ASSETS_LIST[0]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    const fetchPrices = async () => {
      try {
        const ids = ASSETS_LIST.map(a => a.id).join(',');
        const res = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`);
        setPrices(res.data);
      } catch (e) { console.error("Erro API:", e); }
    };
    fetchPrices();
    return () => clearInterval(timer);
  }, []);

  const getValUSD = () => {
    if (!swapAmount || !prices[swapOrigin.id]) return "0.00";
    return (swapAmount * prices[swapOrigin.id].usd).toLocaleString('en-US', { minimumFractionDigits: 2 });
  };

  const getReturn = () => {
    if (!swapAmount || !prices[swapOrigin.id] || !prices[swapDest.id]) return "0.00";
    return ((swapAmount * prices[swapOrigin.id].usd) / prices[swapDest.id].usd).toFixed(6);
  };

  return (
    <div className="modular-container">
      <header className="os-header">
        <div className="os-brand"><img src={logoImg} alt="L" /> <span>NEURA OS v1.2</span></div>
        <ConnectButton showBalance={false} chainStatus="icon" accountStatus="address" />
      </header>

      <div className="desktop-area">
        
        {/* JANELA: GRÁFICO */}
        <Draggable handle=".win-handle" defaultPosition={{x: 220, y: 20}}>
          <div className="window win-chart">
            <div className="win-handle">
              <span className="win-title">📊 MARKET TERMINAL: {chartAsset.symbol}</span>
              <div className="win-dots"><span className="dot"></span></div>
            </div>
            <div className="win-body">
              <div className="win-toolbar">
                <select value={chartAsset.symbol} onChange={(e) => setChartAsset(ASSETS_LIST.find(a => a.symbol === e.target.value))}>
                  {ASSETS_LIST.map(a => <option key={a.symbol} value={a.symbol}>{a.symbol}</option>)}
                </select>
                <span className="neon-text">${prices[chartAsset.id]?.usd || '0.00'}</span>
              </div>
              <iframe src={`https://s.tradingview.com/widgetembed/?symbol=${chartAsset.pair}&theme=dark&interval=D`} width="100%" height="100%" frameBorder="0"></iframe>
            </div>
          </div>
        </Draggable>

        {/* JANELA: SWAP */}
        <Draggable handle=".win-handle" defaultPosition={{x: 20, y: 20}}>
          <div className="window win-swap">
            <div className="win-handle">
              <span className="win-title">⚡ QUICK SWAP</span>
              <div className="win-dots"><span className="dot"></span></div>
            </div>
            <div className="win-body p-15">
              <div className="swap-box">
                <div className="row-between">
                  <label className="label-min">FROM</label>
                  <span className="label-val">${getValUSD()}</span>
                </div>
                <div className="input-row">
                  <select value={swapOrigin.symbol} onChange={e => setSwapOrigin(ASSETS_LIST.find(a => a.symbol === e.target.value))}>
                    {ASSETS_LIST.map(a => <option key={a.symbol} value={a.symbol}>{a.symbol}</option>)}
                  </select>
                  <input type="number" placeholder="0.00" value={swapAmount} onChange={e => setSwapAmount(e.target.value)} />
                </div>
                
                <div className="swap-mid" onClick={() => {const t=swapOrigin; setSwapOrigin(swapDest); setSwapDest(t);}}>⇅</div>

                <label className="label-min">TO (ESTIMATED)</label>
                <div className="input-row">
                  <select value={swapDest.symbol} onChange={e => setSwapDest(ASSETS_LIST.find(a => a.symbol === e.target.value))}>
                    {ASSETS_LIST.map(a => <option key={a.symbol} value={a.symbol}>{a.symbol}</option>)}
                  </select>
                  <div className="fake-input">{getReturn()}</div>
                </div>
                <button className="swap-btn">EXECUTE CONVERSION</button>
              </div>
            </div>
          </div>
        </Draggable>

        {/* JANELA: WALLET */}
        <Draggable handle=".win-handle" defaultPosition={{x: 20, y: 340}}>
          <div className="window win-wallet">
            <div className="win-handle">
              <span className="win-title">🔑 WALLET</span>
            </div>
            <div className="win-body p-10">
              <div className="wallet-addr">{isConnected ? address : 'DISCONNECTED'}</div>
              <div className="wallet-bal">ANKR: <span className="neon-text">1,250.00</span></div>
            </div>
          </div>
        </Draggable>

        {/* JANELA: MONITOR */}
        <Draggable handle=".win-handle" defaultPosition={{x: 940, y: 20}}>
          <div className="window win-monitor">
            <div className="win-handle">
              <span className="win-title">📡 SYS</span>
            </div>
            <div className="win-body text-center p-10">
              <img src={animationGif} alt="sys" className="monitor-gif" />
              <div className="monitor-time">{time}</div>
            </div>
          </div>
        </Draggable>

      </div>

      <footer className="os-footer">
        <div className="ticker-wrap">
          {ASSETS_LIST.concat(ASSETS_LIST).map((a, i) => (
            <div key={i} className="ticker-item">
              {a.symbol}: <span className="neon-text">${prices[a.id]?.usd?.toFixed(2) || '0.00'}</span>
            </div>
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
