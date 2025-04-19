import { useEffect, useRef } from 'react';

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
  { proName: "CBOE:VIX", title: "VIX" },
  { proName: "NASDAQ:NDX", title: "NAS100" },
  { proName: "CURRENCYCOM:US30", title: "US30" },
  { proName: "NASDAQ:NVDA", title: "NVIDIA" },
  { proName: "NASDAQ:TSLA", title: "Tesla" }
];

export default function TickerTape() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

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

    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, []);

  return (
    <div className="tradingview-widget-container mb-4">
      <div ref={containerRef} className="h-[46px]" />
    </div>
  );
}
