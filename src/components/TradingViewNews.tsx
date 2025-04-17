import { useEffect } from 'react';

function TradingViewNews() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-timeline.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      "feedMode": "all_symbols",
      "isTransparent": true,
      "displayMode": "regular",
      "width": "100%",
      "height": "100%",
      "colorTheme": "dark",
      "locale": "en"
    });

    const widgetContainer = document.getElementById('tv-news-widget');
    if (widgetContainer) {
      widgetContainer.appendChild(script);
    }

    return () => {
      if (widgetContainer) {
        widgetContainer.innerHTML = '';
      }
    };
  }, []);

  return (
    <div className="h-full w-full bg-[#1A1A1A] rounded-lg overflow-hidden">
      <div id="tv-news-widget" className="tradingview-widget-container h-full">
        <div className="tradingview-widget-container__widget h-full"></div>
      </div>
    </div>
  );
}

export default TradingViewNews;
