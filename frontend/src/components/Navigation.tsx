import { motion } from 'motion/react';
import { Button } from './ui/button';

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isLoggedIn: boolean;
}

export function Navigation({ currentPage, onNavigate, isLoggedIn }: NavigationProps) {
  if (!isLoggedIn) return null;

  const pages = [
    { id: 'questions', label: 'Challenges', icon: '🧩' },
    { id: 'leaderboard', label: 'Leaderboard', icon: '🏆' },
  ];

  return (
    <nav className="bg-white border-b-2 border-black p-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <motion.div 
          className="text-2xl font-bold cursor-pointer"
          style={{ fontFamily: 'Patrick Hand, cursive' }}
          onClick={() => onNavigate('questions')}
          whileHover={{ 
            scale: 1.05,
            transition: { duration: 0.2 }
          }}
          animate={{
            y: [0, -2, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          Vibe n Code
        </motion.div>

        {/* Navigation Links */}
        <div className="flex items-center gap-4">
          {pages.map((page) => (
            <Button
              key={page.id}
              onClick={() => onNavigate(page.id)}
              className={`py-2 px-4 border-2 border-black rounded-lg transition-colors ${
                currentPage === page.id
                  ? 'bg-black text-white'
                  : 'bg-white text-black hover:bg-gray-100'
              }`}
              style={{ fontFamily: 'Patrick Hand, cursive' }}
            >
              <span className="mr-2">{page.icon}</span>
              {page.label}
            </Button>
          ))}
          
          {/* Logout */}
          <Button
            onClick={() => onNavigate('login')}
            className="py-2 px-4 border-2 border-red-500 bg-white text-red-500 rounded-lg hover:bg-red-50 transition-colors"
            style={{ fontFamily: 'Patrick Hand, cursive' }}
          >
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
}