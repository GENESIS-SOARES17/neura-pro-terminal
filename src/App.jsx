import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getDefaultConfig, RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { WagmiProvider, useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { parseEther } from 'viem';
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

// Lista atualizada conforme as fotos enviadas
const ASSETS = [
  { symbol: 'ANKR', id: 'ankr', pair: 'BINANCE:ANKRUSDT' },
  { symbol: 'BTC', id: 'bitcoin', pair: 'BITSTAMP:BTCUSD' },
  { symbol: 'ETH', id: 'ethereum', pair: 'BITSTAMP:ETHUSD' },
  { symbol: 'SOL', id: 'solana', pair: 'BINANCE:SOLUSDT' },
  { symbol: 'BNB', id: 'binancecoin', pair: 'BINANCE:BNBUSDT' },
  { symbol: 'XRP', id: 'ripple', pair: 'BINANCE:XRPUSDT' },
  { symbol: 'ADA', id: 'cardano', pair: 'BINANCE:ADAUSDT' },
  { symbol: 'USDC', id: 'usd-coin', pair: 'BINANCE:USDCUSDT' },
  { symbol: 'TRX', id: 'tron', pair: 'BINANCE:TRXUSDT' },
  { symbol: 'SUI', id: 'sui', pair: 'BINANCE:SUIUSDT' },
  { symbol: 'POL', id: 'matic-network', pair: 'BINANCE:POLUSDT' },
  { symbol: 'HYPE', id: 'hyperliquid', pair: 'BYBIT:HYPEUSDT' },
  { symbol: 'AVAX', id: 'avalanche-2', pair: 'BINANCE:AVAXUSDT' },
  { symbol: 'JUP', id: 'jupiter-exchange-solana', pair: 'BINANCE:JUPUSDT' },
  { symbol: 'DOT', id: 'polkadot', pair: 'BINANCE:DOTUSDT' },
  { symbol: 'XLM', id: 'stellar', pair: 'BINANCE:XLMUSDT' }
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
    <div className="terminal-container" style={{backgroundImage: `linear-gradient(rgba(0,0,0,0.9), rgba(0,0,0,0.9)), url(${fundoImg})`}}>
      <div className="scanline"></div>
      
      <header className="top-nav">
        <div className="logo-box"><img src={logoImg} alt="logo" /></div>
        <div className="terminal-title">NEURA PRO TERMINAL v1.1</div>
        <div className="wallet-btn-area"><ConnectButton label="CONNECT" /></div>
      </header>

      <main className="content-grid">
        {/* COLUNA ESQUERDA: SWAP ENGINE COMPLETO */}
        <aside className="left-panel">
          <div className="glass-card swap-card">
            <h2 className="card-label">SWAP ENGINE</h2>
            <div className="swap-form">
              <div className="field">
                <label>ORIGIN</label>
                <select className="input-box"><option>ANKR</option></select>
                <input type="number" className="input-box" placeholder="0.00" value={swapAmount} onChange={e => setSwapAmount(e.target.value)} />
              </div>
              <div className="swap-arrow">⇅</div>
              <div className="field">
                <label>DESTINATION</label>
                <select className="input-box"><option>BTC</option></select>
                <div className="result-field">{swapAmount ? (swapAmount * 0.00000005).toFixed(8) : "0.00000000"}</div>
              </div>
              <button className="execute-btn">EXECUTE SWAP</button>
            </div>
          </div>

          <div className="glass-card transfer-card">
            <h2 className="card-label">TRANSFER</h2>
            <input className="input-box" placeholder="Qty..." />
            <input className="input-box" placeholder="Recipient 0x..." />
            <button className="execute-btn">SEND ASSETS</button>
          </div>
        </aside>

        {/* CENTRO: GRÁFICO E BARRA DE ATIVOS */}
        <section className="center-panel">
          <div className="asset-grid">
            {ASSETS.map(a => (
              <button key={a.symbol} onClick={() => setChartSymbol(a.pair)} className={chartSymbol === a.pair ? 'asset-tab active' : 'asset-tab'}>
                {a.symbol}
              </button>
            ))}
          </div>
          <div className="glass-card chart-frame">
            <iframe src={`https://s.tradingview.com/widgetembed/?symbol=${chartSymbol}&interval=D&theme=dark`} width="100%" height="100%" frameBorder="0" title="tv-chart"></iframe>
          </div>
        </section>

        {/* COLUNA DIREITA: WALLET E COLLECTIONS */}
        <aside className="right-panel">
          <div className="glass-card wallet-card">
            <h2 className="card-label">WALLET INFO</h2>
            <div className="info-text">{isConnected ? address : '0x00...0000'}</div>
            <div className="balance-text">ANKR: <span className="neon">1,250.00</span></div>
          </div>

          <div className="glass-card collections-card">
            <h2 className="card-label">COLLECTIONS</h2>
            <div className="empty-msg">NO NFTS FOUND</div>
          </div>

          <div className="glass-card monitor-card">
            <h2 className="card-label">SYS MONITOR</h2>
            <img src={animationGif} alt="monitor" className="monitor-gif" />
            <div className="clock-text">SYS_TIME: {time}</div>
          </div>
        </aside>
      </main>

      <footer className="footer-ticker">
        <div className="ticker-scroll">
          {[...ASSETS, ...ASSETS].map((a, i) => (
            <div key={i} className="ticker-unit">
              {a.symbol}: <span className="neon">${prices[a.id]?.usd?.toFixed(2) || '0.00'}</span>
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
