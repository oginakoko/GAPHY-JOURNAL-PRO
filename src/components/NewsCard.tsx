import { useEffect, useState } from 'react';
import { ExternalLink, AlertCircle } from 'lucide-react';

interface NewsItem {
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
}

function NewsCard() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const corsProxy = 'https://cors-anywhere.herokuapp.com/';
        const newsApiUrl = 'https://newsapi.org/v2/top-headlines?country=us&category=business&apiKey=142e1dab1c5d4e739148d349d838d6dd';
        
        const response = await fetch(corsProxy + newsApiUrl, {
          headers: {
            'Origin': window.location.origin,
            'X-Requested-With': 'XMLHttpRequest'
          }
        });

        if (!response.ok) {
          // Fallback to static data if API fails
          setNews([
            {
              title: "Market Analysis: Global Trading Trends",
              description: "Latest updates on market movements and trading opportunities across major financial markets.",
              url: "https://www.tradingview.com/markets/stocks-usa/market-movers-gainers/",
              urlToImage: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3",
              publishedAt: new Date().toISOString()
            },
            {
              title: "Crypto Market Updates",
              description: "Current cryptocurrency market trends and analysis.",
              url: "https://www.tradingview.com/markets/cryptocurrencies/prices-all/",
              urlToImage: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d",
              publishedAt: new Date().toISOString()
            },
            {
              title: "Forex Trading Insights",
              description: "Latest forex market movements and trading opportunities.",
              url: "https://www.tradingview.com/markets/currencies/rates-all/",
              urlToImage: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e",
              publishedAt: new Date().toISOString()
            }
          ]);
          return;
        }

        const data = await response.json();
        if (data.articles && Array.isArray(data.articles)) {
          setNews(data.articles);
        }
      } catch (error) {
        console.error('News fetch error:', error);
        setError('Unable to load news feed');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  useEffect(() => {
    if (news.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % news.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [news]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        Loading news...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 p-6">
        <AlertCircle className="w-8 h-8 mb-2 text-red-400" />
        <p className="text-center">{error}</p>
      </div>
    );
  }

  if (!news.length) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        No news available
      </div>
    );
  }

  const currentNews = news[currentIndex];

  return (
    <div className="relative h-full group">
      <img
        src={currentNews.urlToImage || 'https://via.placeholder.com/400x300'}
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
