import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink } from 'lucide-react';

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  source: { name: string };
}

const NEWS_API_KEY = '142e1dab1c5d4e739148d349d838d6dd';
const NEWS_API_ENDPOINT = 'https://newsapi.org/v2/top-headlines?country=us&category=business&apiKey=' + NEWS_API_KEY;

const NewsCard: React.FC = () => {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(NEWS_API_ENDPOINT);
        if (!response.ok) {
          throw new Error('HTTP error! status: ' + response.status);
        }
        const data = await response.json();
        setNews(data.articles || []);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to fetch news');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % news.length);
    }, 5000); // Change news every 5 seconds

    return () => clearInterval(interval);
  }, [news.length]);

  if (loading) {
    return <p>Loading news...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  if (!news || news.length === 0) {
    return <p>No news available.</p>;
  }

  return (
    <div className="bg-[#252525] rounded-xl overflow-hidden">
      <div className="p-6 h-[500px] relative"> {/* Increased height */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full flex flex-col"
          >
            <a
              href={news[currentIndex].url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col flex-grow hover:opacity-80 transition-opacity"
            >
              <div className="aspect-video rounded-lg overflow-hidden mb-4 flex-shrink-0">
                <img
                  src={news[currentIndex].urlToImage || '/news-placeholder.png'}
                  alt={news[currentIndex].title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-grow flex flex-col">
                <h3 className="text-xl font-semibold text-white/90 mb-4 line-clamp-3">
                  {news[currentIndex].title}
                </h3>
                <p className="text-white/60 mb-4 line-clamp-4">
                  {news[currentIndex].description}
                </p>
                <div className="flex items-center gap-2 mt-auto text-sm text-white/40">
                  <span className="truncate max-w-[150px]">{news[currentIndex].source.name}</span>
                  <span>•</span>
                  <span>{new Date(news[currentIndex].publishedAt).toLocaleDateString()}</span>
                  <ExternalLink className="w-4 h-4 ml-auto flex-shrink-0" />
                </div>
              </div>
            </a>
          </motion.div>
        </AnimatePresence>

        {/* Pagination Dots */}
        <div className="absolute bottom-6 left-0 right-0 px-6">
          <div className="flex justify-center gap-1.5">
            {news.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  currentIndex === index ? 'bg-blue-400' : 'bg-white/20'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsCard;
