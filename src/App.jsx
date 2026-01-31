import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getDefaultConfig, RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { WagmiProvider, useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { parseEther } from 'viem';
import '@rainbow-me/rainbowkit/styles.css';
import './App.css';

// Importação de Assets
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

// Lista expandida para preencher o espaço do cabeçalho
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
  { symbol: 'XLM', id: 'stellar', pair: 'BINANCE:XLMUSDT' },
  { symbol: 'AVAX', id: 'avalanche-2', pair: 'BINANCE:AVAXUSDT' },
  { symbol: 'DOT', id: 'polkadot', pair: 'BINANCE:DOTUSDT' },
  { symbol: 'JUP', id: 'jupiter-exchange-solana', pair: 'BINANCE:JUPUSDT' },
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
        const res = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`);
        setPrices(res.data);
      } catch (e) { console.error(e); }
    };
    fetchPrices();
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="terminal-v1-1" style={{backgroundImage: `linear-gradient(rgba(0,0,0,0.9), rgba(0,0,0,0.9)), url(${fundoImg})`}}>
      <div className="crt-effect"></div>
      
      <header className="main-nav">
        <div className="brand"><img src={logoImg} alt="logo" /></div>
        <div className="terminal-id">NEURA PRO TERMINAL v1.1</div>
        <div className="auth-area"><ConnectButton label="CONNECT" /></div>
      </header>

      <main className="dashboard-grid">
        {/* COLUNA ESQUERDA: SWAP E TRANSFER */}
        <aside className="panel-side">
          <section className="glass-panel swap-engine">
            <h2 className="label-tag">SWAP ENGINE</h2>
            <div className="swap-logic">
              <div className="input-box">
                <label>ORIGIN</label>
                <select className="ui-select"><option>ANKR</option></select>
                <input type="number" className="ui-num" placeholder="0.00" value={swapAmount} onChange={e => setSwapAmount(e.target.value)} />
              </div>
              <div className="ui-arrow">⇅</div>
              <div className="input-box">
                <label>DESTINATION</label>
                <select className="ui-select"><option>BTC</option></select>
                <div className="ui-readonly">{swapAmount ? (swapAmount * 0.00000004).toFixed(8) : "0.00000000"}</div>
              </div>
              <button className="ui-btn neon-fill">EXECUTE SWAP</button>
            </div>
          </section>

          <section className="glass-panel">
            <h2 className="label-tag">TRANSFER</h2>
            <input className="ui-num" placeholder="Qty..." />
            <input className="ui-num" placeholder="Recipient 0x..." />
            <button className="ui-btn">SEND ASSETS</button>
          </section>
        </aside>

        {/* CENTRO: CABEÇALHO DE ATIVOS E GRÁFICO */}
        <section className="panel-center">
          <div className="asset-header-grid">
            {ASSETS.map(a => (
              <button 
                key={a.symbol} 
                onClick={() => setChartSymbol(a.pair)} 
                className={chartSymbol === a.pair ? 'asset-card active' : 'asset-card'}
              >
                {a.symbol}
              </button>
            ))}
          </div>
          <div className="glass-panel chart-box">
            <iframe src={`https://s.tradingview.com/widgetembed/?symbol=${chartSymbol}&interval=D&theme=dark`} width="100%" height="100%" frameBorder="0" title="tv"></iframe>
          </div>
        </section>

        {/* COLUNA DIREITA: INFO E MONITOR */}
        <aside className="panel-side">
          <section className="glass-panel">
            <h2 className="label-tag">WALLET INFO</h2>
            <div className="wallet-data">
              <div className="text-small">{isConnected ? address : 'NOT CONNECTED'}</div>
              <div className="text-neon">ANKR: 1,250.00</div>
            </div>
          </section>

          <section className="glass-panel flex-grow">
            <h2 className="label-tag">COLLECTIONS</h2>
            <div className="centered-msg">NO NFTS FOUND</div>
          </section>

          <section className="glass-panel">
            <h2 className="label-tag">SYS MONITOR</h2>
            <img src={animationGif} alt="sys" className="sys-gif" />
            <div className="sys-clock">TIME: {time}</div>
          </section>
        </aside>
      </main>

      <footer className="footer-bar">
        <div className="ticker-wrap">
          {[...ASSETS, ...ASSETS].map((a, i) => (
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
