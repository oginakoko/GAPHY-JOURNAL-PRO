import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Logo from './Logo';
import {
  LayoutDashboard,
  BookOpenCheck,
  BarChart2,
  Archive,
  Settings,
  LogOut,
  Newspaper,
  Book,
  Menu,
  X
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  onLogout: () => void;
}

function Layout({ children, onLogout }: LayoutProps) {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    // Trading Section
    {
      section: 'Trading',
      items: [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Trade Journal', href: '/journal', icon: BookOpenCheck },
        { name: 'Statistics', href: '/statistics', icon: BarChart2 },
      ]
    },
    // Analysis Section
    {
      section: 'Analysis',
      items: [
        { name: 'Trade Archives', href: '/trades', icon: Archive },
        { name: 'Market News', href: '/news', icon: Newspaper },
      ]
    },
    // Personal Section
    {
      section: 'Personal',
      items: [
        { name: 'Life Journal', href: '/life-journal', icon: Book },
        { name: 'Settings', href: '/settings', icon: Settings },
      ]
    }
  ];

  const isActive = (path: string) => {
    return path === '/dashboard' ? 
      ['/', '/dashboard'].includes(location.pathname) : 
      location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-[#141414] text-white">
      <div className="flex">
        <div className="fixed top-0 left-0 bottom-0 w-[200px] bg-[#1A1A1A] border-r border-white/5">
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-center h-16 px-4 border-b border-white/5">
              <Logo />
            </div>

            <nav className="flex-1 px-3 py-4 overflow-y-auto">
              {navigation.map((group) => (
                <div key={group.section} className="mb-6">
                  <h3 className="px-4 mb-2 text-xs font-semibold text-white/40 uppercase tracking-wider">
                    {group.section}
                  </h3>
                  <div className="space-y-1">
                    {group.items.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group ${
                          isActive(item.href)
                            ? 'bg-blue-500/10 text-blue-400'
                            : 'text-white/60 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <item.icon className={`w-5 h-5 transition-colors ${
                          isActive(item.href) 
                            ? 'text-blue-400' 
                            : 'text-white/60 group-hover:text-white'
                        }`} />
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </nav>

            <div className="p-4 border-t border-white/5">
              <button
                onClick={onLogout}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-all group"
              >
                <LogOut className="w-5 h-5 text-white/60 group-hover:text-white" />
                Sign Out
              </button>
            </div>
          </div>
        </div>

        <main className="flex-1 ml-[200px]">
          <div className="max-w-[1400px] mx-auto px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Layout;