import { useState, useEffect } from 'react';
import { ExternalLink } from 'lucide-react';

const STATIC_NEWS = [
  {
    title: "Market Analysis: Global Trading Trends",
    description: "Latest updates on market movements and trading opportunities across major financial markets.",
    url: "https://www.tradingview.com/markets/stocks-usa/market-movers-gainers/",
    urlToImage: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3",
    publishedAt: new Date().toISOString()
  },
  {
    title: "Cryptocurrency Market Updates",
    description: "Current cryptocurrency market trends and analysis for major coins.",
    url: "https://www.tradingview.com/markets/cryptocurrencies/prices-all/",
    urlToImage: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d",
    publishedAt: new Date().toISOString()
  },
  {
    title: "Forex Trading Insights",
    description: "Latest forex market movements and trading opportunities in major pairs.",
    url: "https://www.tradingview.com/markets/currencies/rates-all/",
    urlToImage: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e",
    publishedAt: new Date().toISOString()
  }
];

function NewsCard() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const news = STATIC_NEWS;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % news.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [news.length]);

  const currentNews = news[currentIndex];

  return (
    <div className="relative h-full group">
      <img
        src={currentNews.urlToImage}
        alt={currentNews.title}
        className="w-full h-[300px] object-cover rounded-t-lg"
      />
      <div className="p-6 space-y-4">
        <h3 className="text-xl font-semibold line-clamp-2">{currentNews.title}</h3>
        <p className="text-gray-400 line-clamp-3">{currentNews.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">
            {new Date(currentNews.publishedAt).toLocaleDateString()}
          </span>
          <a
            href={currentNews.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300"
          >
            Read more <ExternalLink size={16} />
          </a>
        </div>
      </div>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {news.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-colors ${
              i === currentIndex ? 'bg-blue-400' : 'bg-gray-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default NewsCard;
