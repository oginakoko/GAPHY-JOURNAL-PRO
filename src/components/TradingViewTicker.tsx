import React, { useEffect } from 'react';

function TradingViewTicker() {
  useEffect(() => {
    // Wait for DOM to be ready
    const initWidget = () => {
      const container = document.getElementById('tv-ticker-tape');
      if (!container) return;
      
      // Clear previous widget
      container.innerHTML = '';
      
      // Create widget container
      const widgetContainer = document.createElement('div');
      widgetContainer.className = 'tradingview-widget-container__widget';
      container.appendChild(widgetContainer);

      // Create script
      const script = document.createElement('script');
      script.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
      script.type = 'text/javascript';
      script.async = true;
      script.innerHTML = JSON.stringify({
        symbols: [
          { proName: "FOREXCOM:SPXUSD", title: "S&P 500" },
          { proName: "FOREXCOM:NSXUSD", title: "NASDAQ 100" },
          { proName: "FX_IDC:EURUSD", title: "EUR/USD" },
          { proName: "BITSTAMP:BTCUSD", title: "BTC/USD" },
          { proName: "FX:USDJPY", title: "USD/JPY" },
          { proName: "OANDA:XAUUSD", title: "Gold" }
        ],
        showSymbolLogo: true,
        colorTheme: "dark",
        isTransparent: true,
        displayMode: "adaptive",
        locale: "en"
      });

      widgetContainer.appendChild(script);
    };

    // Initialize after a short delay to ensure DOM is ready
    const timeoutId = setTimeout(initWidget, 100);

    return () => {
      clearTimeout(timeoutId);
      const container = document.getElementById('tv-ticker-tape');
      if (container) {
        container.innerHTML = '';
      }
    };
  }, []);

  return (
    <div className="w-full bg-[#1A1A1A] overflow-hidden">
      <div id="tv-ticker-tape" className="tradingview-widget-container" style={{ height: '46px' }}>
        <span className="text-sm text-white/90 font-medium">
          Market Overview
        </span>
        <span className="text-xs text-white/80">
          Loading market data...
        </span>
      </div>
    </div>
  );
}

export default TradingViewTicker;
