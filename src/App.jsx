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
  const [selectedGem, setSelectedGem] = useState(null);
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
        
        if (!selectedGem) {
          let sorted = Object.entries(res.data)
            .map(([id, val]) => ({ id, change: val.usd_24h_change || 0 }))
            .sort((a, b) => b.change - a.change);
          if (sorted.length > 0) {
            const gem = ASSETS.find(a => a.id === sorted[0].id);
            setSelectedGem({ ...gem, change: sorted[0].change });
          }
        }
      } catch (e) { console.error(e); }
    };
    fetchPrices();
    const interval = setInterval(fetchPrices, 30000);
    return () => { clearInterval(timer); clearInterval(interval); };
  }, [selectedGem?.id]);

  const handleAssetClick = (asset) => {
    setChartSymbol(asset.pair);
    setSelectedGem({ ...asset, change: prices[asset.id]?.usd_24h_change || 0 });
  };

  return (
    <div className="layout-personalizado" style={{backgroundImage: `linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.8)), url(${fundoImg})`}}>
      <div className="crt-overlay"></div>
      
      <nav className="navbar">
        <div className="logo-section">
          <img src={logoImg} className="minha-logo" alt="logo" />
        </div>
        <div className="terminal-id">NEURA PRO TERMINAL v1.1</div>
        <div className="wallet-section">
          <ConnectButton label="CONNECT" />
        </div>
      </nav>

      <div className="main-grid-layout">
        <aside className="side-col left">
          <div className="glass-panel">
            <h2 className="rect-title">SWAP ENGINE</h2>
            <div className="box-section">
              <label className="bright-label">ORIGIN</label>
              <select className="input-field-transp"><option>ANKR</option></select>
              <input type="number" className="input-field-transp" placeholder="0.00" value={swapAmount} onChange={e => setSwapAmount(e.target.value)} />
              <button className="btn-neon">EXECUTE SWAP</button>
            </div>
          </div>

          <div className="glass-panel">
            <h2 className="rect-title">TRANSFER</h2>
            <div className="box-section">
              <input className="input-field-transp" placeholder="Recipient 0x..." onChange={e => setRecipient(e.target.value)} />
              <button className="btn-neon" onClick={() => sendTransaction({ to: recipient, value: parseEther(transfQty) })}>
                {isPending ? 'SENDING...' : 'SEND ASSETS'}
              </button>
            </div>
          </div>
        </aside>

        <main className="center-panel">
          <div className="chart-header">
            <div className="chart-selector-grid">
              {ASSETS.slice(0, 10).map(a => (
                <button key={a.symbol} onClick={() => handleAssetClick(a)} className={chartSymbol === a.pair ? 'btn-chart-active' : 'btn-chart-normal'}>
                  {a.symbol}
                </button>
              ))}
            </div>
          </div>
          
          <div className="glass-panel chart-wrapper">
            {selectedGem && (
              <div className="gem-scanner-badge">
                <span className="scanner-dot"></span>
                GEM: {selectedGem.symbol} ({selectedGem.change.toFixed(2)}%)
              </div>
            )}
            <iframe src={`https://s.tradingview.com/widgetembed/?symbol=${chartSymbol}&interval=D&theme=dark`} width="100%" height="100%" frameBorder="0" className="graph-iframe" title="chart"></iframe>
          </div>
          <div className="terminal-footer-label">NEURA PRO TERMINAL CORE</div>
        </main>

        <aside className="side-col right">
          <div className="glass-panel">
            <h2 className="rect-title">WALLET INFO</h2>
            <div className="wallet-info-hub">
              <div className="addr-txt">{isConnected ? `${address.slice(0,6)}...${address.slice(-4)}` : 'DISCONNECTED'}</div>
              <div className="balance-item">ANKR: <span className="green-val">1,250.00</span></div>
            </div>
          </div>

          <div className="glass-panel animation-box">
              <h2 className="rect-title">SYS MONITOR</h2>
              <div className="monitor-content">
                <img src={animationGif} alt="Animation" className="side-gif" />
                <div className="live-clock-terminal">{time}</div>
              </div>
          </div>
        </aside>
      </div>

      <footer className="footer-ticker-bar">
        <div className="ticker-track">
          {ASSETS.map((asset, index) => (
            <div key={index} className="ticker-item">
              <span className="asset-name">{asset.symbol}</span>
              <span className="asset-price">${prices[asset.id]?.usd?.toFixed(2) || '0.00'}</span>
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
