import { useEffect } from 'react';
import { motion } from 'framer-motion';
import NewsCard from '../components/NewsCard';
import { Newspaper } from 'lucide-react';
import { withPageWrapper } from '../components/PageWrapper';

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
      "locale": "en"
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
    <div className="space-y-8">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1E1E1E] via-[#252525] to-[#1A1A1A] p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-500/10 via-purple-500/5 to-transparent" />
        <div className="relative z-10">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center gap-6"
          >
            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 backdrop-blur-xl">
              <Newspaper className="w-10 h-10 text-blue-400" />
            </div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                Market News
              </h1>
              <p className="text-lg text-white/80 mt-2">Stay updated with the latest market developments</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* News Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Curated News Card */}
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="bg-gradient-to-br from-[#1A1A1A] via-[#252525] to-[#1A1A1A] rounded-xl overflow-hidden hover:ring-2 hover:ring-blue-500/20 transition-all"
        >
          <NewsCard />
        </motion.div>

        {/* TradingView News Feed */}
        <motion.div 
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="bg-gradient-to-br from-[#1A1A1A] via-[#252525] to-[#1A1A1A] rounded-xl overflow-hidden hover:ring-2 hover:ring-blue-500/20 transition-all h-[600px]"
        >
          <div id="tradingview-news" className="tradingview-widget-container h-full" />
        </motion.div>
      </div>
    </div>
  );
}

export default withPageWrapper(News, 'News');
