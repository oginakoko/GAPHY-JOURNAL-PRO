import { useEffect, useRef, useState } from 'react';

const SYMBOLS = [
  { proName: "FOREXCOM:XAUUSD", title: "Gold" },
  { proName: "FOREXCOM:EURUSD", title: "EUR/USD" },
  { proName: "FOREXCOM:EURAUD", title: "EUR/AUD" },
  { proName: "BITSTAMP:BTCUSD", title: "Bitcoin" },
  { proName: "FOREXCOM:XAGUSD", title: "Silver" },
  { proName: "OANDA:WTICOUSD", title: "WTI" },
  { proName: "FOREXCOM:USDJPY", title: "USD/JPY" },
  { proName: "FOREXCOM:GBPJPY", title: "GBP/JPY" },
  { proName: "FOREXCOM:CADJPY", title: "CAD/JPY" },
  { proName: "FOREXCOM:USDCAD", title: "USD/CAD" },
  { proName: "FOREXCOM:NZDUSD", title: "NZD/USD" },
  { proName: "FOREXCOM:USDCHF", title: "USD/CHF" },
  { proName: "PEPPERSTONE:VIX", title: "VIX" },
  { proName: "NASDAQ:NDX", title: "NAS100" },
  { proName: "BLACKBULL:US30", title: "US30" },
  { proName: "NASDAQ:NVDA", title: "NVIDIA" },
  { proName: "NASDAQ:TSLA", title: "Tesla" }
];

export default function TickerTape() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) {
      setError('TickerTape container not found');
      return;
    }

    try {
      // Clear previous content
      containerRef.current.innerHTML = '';

      // Create widget container
      const widgetContainer = document.createElement('div');
      widgetContainer.className = 'tradingview-widget-container__widget';
      containerRef.current.appendChild(widgetContainer);

      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
      script.async = true;
      script.type = 'text/javascript';
      script.innerHTML = JSON.stringify({
        symbols: SYMBOLS,
        showSymbolLogo: true,
        colorTheme: "dark",
        isTransparent: true,
        displayMode: "adaptive",
        locale: "en"
      });

      script.onerror = () => setError('Failed to load TradingView widget');
      containerRef.current.appendChild(script);
    } catch (err) {
      setError('Error initializing TickerTape');
      console.error(err);
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, []);

  return (
    <div className="tradingview-widget-container mb-4">
      {error ? (
        <div className="text-red-500 text-sm p-2 bg-red-500/10 rounded">
          TickerTape Error: {error}
        </div>
      ) : (
        <div ref={containerRef} className="h-[46px]" />
      )}
    </div>
  );
}
