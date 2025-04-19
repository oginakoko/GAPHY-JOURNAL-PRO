import { BarChart2, TrendingUp } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
}

const Logo = ({ size = 'md' }: LogoProps) => {
  const sizes = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-12'
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className="absolute inset-0 blur-sm bg-gradient-to-r from-blue-500 to-black-500 opacity-50" />
        <div className="relative z-10 flex items-center">
          <BarChart2 
            className={`${sizes[size]} text-blue-400`} 
            strokeWidth={1.5} 
          />
          <TrendingUp 
            className={`${sizes[size]} -ml-2 text-purple-400`} 
            strokeWidth={1.5}
          />
        </div>
      </div>
      <span className={`font-bold ${
        size === 'sm' ? 'text-lg' : 
        size === 'md' ? 'text-xl' : 
        'text-3xl'
      }`}>
        GAPHY
      </span>
    </div>
  );
};

export default Logo;
