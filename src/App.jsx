import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getDefaultConfig, RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { WagmiProvider, useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { parseEther } from 'viem';
import '@rainbow-me/rainbowkit/styles.css';
import './App.css';

// Importações de assets
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
  { symbol: 'DOT', id: 'polkadot', pair: 'BINANCE:DOTUSDT' },
  { symbol: 'LINK', id: 'chainlink', pair: 'BINANCE:LINKUSDT' },
  { symbol: 'DOGE', id: 'dogecoin', pair: 'BINANCE:DOGEUSDT' },
  { symbol: 'NEAR', id: 'near', pair: 'BINANCE:NEARUSDT' },
  { symbol: 'APT', id: 'aptos', pair: 'BINANCE:APTUSDT' },
  { symbol: 'UNI', id: 'uniswap', pair: 'BINANCE:UNIUSDT' },
  { symbol: 'ARB', id: 'arbitrum', pair: 'BINANCE:ARBUSDT' },
];

function WalletInterface() {
  const { address, isConnected } = useAccount();
  const [chartSymbol, setChartSymbol] = useState('BINANCE:ANKRUSDT');
  const [prices, setPrices] = useState({});
  const [topGem, setTopGem] = useState(null);
  const [swapAmount, setSwapAmount] = useState('');
  const [transfQty, setTransfQty] = useState('');
  const [recipient, setRecipient] = useState('');
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  const { data: hash, sendTransaction, isPending } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess, isError } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    const fetchPrices = async () => {
      try {
        const ids = ASSETS.map(a => a.id).join(',');
        const res = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`);
        setPrices(res.data);
        
        // Lógica do Scanner de Gems
        let bestPerformers = Object.entries(res.data)
          .map(([id, val]) => ({ id, change: val.usd_24h_change || 0 }))
          .sort((a, b) => b.change - a.change);
        
        if (bestPerformers.length > 0) {
          const gem = ASSETS.find(a => a.id === bestPerformers[0].id);
          setTopGem({ ...gem, change: bestPerformers[0].change });
        }
      } catch (e) { console.error(e); }
    };
    fetchPrices();
    const interval = setInterval(fetchPrices, 30000);
    return () => { clearInterval(timer); clearInterval(interval); };
  }, []);

  return (
    <div className="layout-personalizado" style={{backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(${fundoImg})`}}>
      
      <div className="crt-overlay"></div>

      <nav className="navbar">
        <img src={logoImg} className="minha-logo" alt="logo" />
        <div className="terminal-id">NEURA PRO TERMINAL v1.0</div>
        <ConnectButton label="CONNECT" />
      </nav>

      <div className="main-grid-layout">
        <div className="grid-item side-col">
          <div className="glass-panel compact">
            <h2 className="rect-title">SWAP ENGINE</h2>
            <div className="box-section">
              <label className="bright-label">ORIGIN</label>
              <select className="input-field-transp"><option>ANKR</option></select>
              <input type="number" className="input-field-transp" placeholder="0.00" value={swapAmount} onChange={e => setSwapAmount(e.target.value)} />
              <label className="bright-label">DESTINATION</label>
              <select className="input-field-transp"><option>BTC</option></select>
              <div className="result-display-box">{swapAmount ? (swapAmount * 0.98).toFixed(6) : "0.0000"}</div>
              <button className="btn-neon">EXECUTE SWAP</button>
            </div>
          </div>

          <div className="glass-panel compact">
            <h2 className="rect-title">TRANSFER</h2>
            <div className="box-section">
              <input type="number" className="input-field-transp" placeholder="Qty..." onChange={e => setTransfQty(e.target.value)} />
              <input className="input-field-transp" placeholder="Recipient 0x..." onChange={e => setRecipient(e.target.value)} />
              <button className="btn-neon" onClick={() => sendTransaction({ to: recipient, value: parseEther(transfQty) })}>
                {isPending ? 'SENDING...' : 'SEND ASSETS'}
              </button>
              <div className={`status-display ${isSuccess ? 'success' : isError ? 'error' : ''}`}>
                {isSuccess ? 'SUCCESS' : isError ? 'ERROR' : 'READY'}
              </div>
            </div>
          </div>
        </div>

        <div className="grid-item center-panel">
          <div className="chart-selector-grid">
            {ASSETS.slice(0, 12).map(a => (
              <button key={a.symbol} onClick={() => setChartSymbol(a.pair)} className={chartSymbol === a.pair ? 'btn-chart-active' : 'btn-chart-normal'}>
                {a.symbol}
              </button>
            ))}
          </div>
          <div className="glass-panel chart-wrapper">
            {/* BADGE DE TRENDING GEM */}
            {topGem && (
              <div className="gem-scanner-badge">
                <span className="scanner-dot"></span>
                TOP_GEM: {topGem.symbol} (+{topGem.change.toFixed(2)}%)
              </div>
            )}
            <iframe src={`https://s.tradingview.com/widgetembed/?symbol=${chartSymbol}&interval=D&theme=dark`} width="100%" height="100%" frameBorder="0" className="graph-iframe" title="chart"></iframe>
          </div>
          <h1 className="main-title">NEURA PRO TERMINAL</h1>
        </div>

        <div className="grid-item side-col">
          <div className="glass-panel compact">
            <h2 className="rect-title">WALLET INFO</h2>
            <div className="wallet-info-hub">
              <div className="addr-txt">{isConnected ? `${address.slice(0,10)}...${address.slice(-6)}` : 'NOT CONNECTED'}</div>
              <div className="balance-item"><span>ANKR:</span><span className="green-val">1,250.00</span></div>
            </div>
          </div>

          <div className="glass-panel compact">
            <h2 className="rect-title">COLLECTIONS</h2>
            <div className="nft-grid-placeholder">NO NFTS FOUND</div>
          </div>

          <div className="glass-panel compact animation-box">
              <h2 className="rect-title">SYS MONITOR</h2>
              <img src={animationGif} alt="Animation" className="side-gif" />
              <div className="live-clock-terminal">SYS_TIME: {time}</div>
          </div>
        </div>
      </div>

      <div className="footer-ticker-bar">
        <div className="ticker-track">
          {[...ASSETS, ...ASSETS].map((asset, index) => (
            <div key={index} className={`ticker-item ${asset.symbol === 'ANKR' ? 'highlight-ankr' : ''}`}>
              <span className="asset-name">{asset.symbol}</span>
              <span className="asset-price">${prices[asset.id]?.usd ? prices[asset.id].usd.toFixed(2) : '0.00'}</span>
              <span className="ticker-bullet">•</span>
            </div>
          ))}
        </div>
      </div>
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
