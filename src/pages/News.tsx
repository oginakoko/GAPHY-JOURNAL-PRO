import TradingViewNews from '../components/TradingViewNews';
import NewsCard from '../components/NewsCard';
import { Newspaper } from 'lucide-react';

function News() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <Newspaper className="w-6 h-6 text-blue-400" />
        <h1 className="text-3xl md:text-4xl font-bold">Market News</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 auto-rows-[700px]">
        <div className="bg-[#1A1A1A] rounded-lg overflow-hidden hover:ring-2 hover:ring-blue-500/20 transition-all">
          <TradingViewNews />
        </div>
        <div className="bg-[#1A1A1A] rounded-lg overflow-hidden hover:ring-2 hover:ring-blue-500/20 transition-all">
          <NewsCard />
        </div>
      </div>
    </div>
  );
}

export default News;
