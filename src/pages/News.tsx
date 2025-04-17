import { useEffect } from 'react';
import NewsCard from '../components/NewsCard';
import { Newspaper } from 'lucide-react';

function News() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-timeline.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      "feedMode": "all_symbols",
      "colorTheme": "dark",
      "isTransparent": true,
      "displayMode": "regular",
      "width": "100%",
      "height": "100%",
      "locale": "en",
      "autosize": true,
      "interval": 5 // Auto scroll every 5 seconds
    });

    const widgetContainer = document.getElementById('tradingview-news');
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
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <Newspaper className="w-6 h-6 text-blue-400" />
        <h1 className="text-3xl md:text-4xl font-bold">Market News</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 auto-rows-[600px]">
        <div className="bg-[#1A1A1A] rounded-lg overflow-hidden hover:ring-2 hover:ring-blue-500/20 transition-all">
          <NewsCard />
        </div>
        <div className="bg-[#1A1A1A] rounded-lg overflow-hidden hover:ring-2 hover:ring-blue-500/20 transition-all">
          <div id="tradingview-news" className="tradingview-widget-container h-full" />
        </div>
      </div>
    </div>
  );
}

export default News;
