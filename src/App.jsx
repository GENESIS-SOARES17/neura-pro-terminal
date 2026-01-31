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
  { symbol: 'HYPE', id: 'hyperliquid', pair: 'BYBIT:HYPEUSDT' }
];

function WalletInterface() {
  const { address, isConnected } = useAccount();
  const [chartSymbol, setChartSymbol] = useState('BINANCE:ANKRUSDT');
  const [prices, setPrices] = useState({});
  const [selectedGem, setSelectedGem] = useState(null);
  const [swapAmount, setSwapAmount] = useState('');
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    const fetchPrices = async () => {
      try {
        const ids = ASSETS.map(a => a.id).join(',');
        const res = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`);
        setPrices(res.data);
        
        // Se não houver seleção manual, o modo automático escolhe a melhor gema
        if (!selectedGem) {
          let best = Object.entries(res.data)
            .map(([id, val]) => ({ id, change: val.usd_24h_change || 0 }))
            .sort((a, b) => b.change - a.change)[0];
          const gem = ASSETS.find(a => a.id === best.id);
          setSelectedGem({ ...gem, change: best.change, isAuto: true });
        } else {
          // Atualiza o preço da gema selecionada
          const currentChange = res.data[selectedGem.id]?.usd_24h_change || 0;
          setSelectedGem(prev => ({ ...prev, change: currentChange }));
        }
      } catch (e) { console.error(e); }
    };
    fetchPrices();
    const interval = setInterval(fetchPrices, 30000);
    return () => { clearInterval(timer); clearInterval(interval); };
  }, [selectedGem?.id]);

  const handleManualSelect = (asset) => {
    setChartSymbol(asset.pair);
    setSelectedGem({ ...asset, change: prices[asset.id]?.usd_24h_change || 0, isAuto: false });
  };

  return (
    <div className="layout-personalizado" style={{backgroundImage: `linear-gradient(rgba(0,0,0,0.85), rgba(0,0,0,0.85)), url(${fundoImg})`}}>
      <div className="crt-overlay"></div>
      
      <header className="navbar">
        <div className="logo-container"><img src={logoImg} className="minha-logo" alt="logo" /></div>
        <div className="terminal-header-title">NEURA PRO TERMINAL v1.1</div>
        <div className="nav-actions"><ConnectButton label="CONNECT" /></div>
      </header>

      <div className="main-content-area">
        {/* COLUNA ESQUERDA: SWAP E TRANSFER */}
        <aside className="side-panel">
          <section className="glass-panel swap-engine">
            <h2 className="panel-title">SWAP ENGINE</h2>
            <div className="box-section">
              <label>ORIGIN</label>
              <select className="ui-input"><option>ANKR</option></select>
              <input type="number" className="ui-input" placeholder="0.00" value={swapAmount} onChange={e => setSwapAmount(e.target.value)} />
              
              <div className="swap-divider">⇅</div>
              
              <label>DESTINATION</label>
              <select className="ui-input"><option>BTC</option></select>
              <div className="result-display">{swapAmount ? (swapAmount * 0.98).toFixed(6) : "0.0000"}</div>
              
              <button className="ui-btn neon-btn">EXECUTE SWAP</button>
            </div>
          </section>

          <section className="glass-panel">
            <h2 className="panel-title">TRANSFER</h2>
            <div className="box-section">
              <input className="ui-input" placeholder="Qty..." />
              <input className="ui-input" placeholder="Recipient 0x..." />
              <button className="ui-btn">SEND ASSETS</button>
            </div>
          </section>
        </aside>

        {/* CENTRO: GRÁFICO E BOTÕES */}
        <main className="chart-main">
          <div className="asset-bar">
            {ASSETS.map(a => (
              <button key={a.symbol} onClick={() => handleManualSelect(a)} className={chartSymbol === a.pair ? 'tab-active' : 'tab-normal'}>
                {a.symbol}
              </button>
            ))}
          </div>
          
          <div className="glass-panel chart-container">
            {selectedGem && (
              <div className="gem-badge" onClick={() => setSelectedGem(null)} title="Click to Reset to Auto">
                <span className="dot-blink"></span>
                {selectedGem.isAuto ? 'TOP_GEM' : 'WATCHING'}: {selectedGem.symbol} ({selectedGem.change.toFixed(2)}%)
              </div>
            )}
            <iframe src={`https://s.tradingview.com/widgetembed/?symbol=${chartSymbol}&interval=D&theme=dark`} width="100%" height="100%" frameBorder="0" title="chart"></iframe>
          </div>
        </main>

        {/* COLUNA DIREITA: WALLET E COLLECTIONS */}
        <aside className="side-panel">
          <section className="glass-panel">
            <h2 className="panel-title">WALLET INFO</h2>
            <div className="wallet-data">
              <div className="addr">{isConnected ? `${address.slice(0,10)}...${address.slice(-4)}` : 'DISCONNECTED'}</div>
              <div className="balance-item">ANKR: <span className="neon-txt">1,250.00</span></div>
            </div>
          </section>

          <section className="glass-panel collections-area">
            <h2 className="panel-title">COLLECTIONS</h2>
            <div className="nft-grid">NO NFTS FOUND</div>
          </section>

          <section className="glass-panel monitor-section">
            <h2 className="panel-title">SYS MONITOR</h2>
            <img src={animationGif} alt="Monitor" className="monitor-gif" />
            <div className="sys-time">SYS_TIME: {time}</div>
          </section>
        </aside>
      </div>

      <footer className="ticker-footer">
        <div className="ticker-wrapper">
          {[...ASSETS, ...ASSETS].map((asset, i) => (
            <div key={i} className="ticker-item">
              <span className="t-name">{asset.symbol}</span>
              <span className="t-price">${prices[asset.id]?.usd?.toFixed(2) || '0.00'}</span>
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
