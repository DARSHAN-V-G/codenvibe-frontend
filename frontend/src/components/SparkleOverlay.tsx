import { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface Sparkle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
}

export function SparkleOverlay() {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);

  useEffect(() => {
    const density = 0.02; // 2% density
    const sparkleCount = Math.floor((window.innerWidth * window.innerHeight) * density / 10000);
    
    const newSparkles: Sparkle[] = [];
    for (let i = 0; i < sparkleCount; i++) {
      newSparkles.push({
        id: i,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: 2 + Math.random() * 4,
        delay: Math.random() * 5
      });
    }
    setSparkles(newSparkles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 1 }}>
      {sparkles.map((sparkle) => (
        <motion.div
          key={sparkle.id}
          className="absolute"
          style={{
            left: sparkle.x,
            top: sparkle.y,
            width: sparkle.size,
            height: sparkle.size,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: sparkle.delay,
            ease: "easeInOut"
          }}
        >
          <div 
            className="w-full h-full"
            style={{
              background: 'radial-gradient(circle, #ffffff 0%, transparent 70%)',
              borderRadius: '50%',
              filter: 'blur(0.5px)'
            }}
          />
        </motion.div>
      ))}
    </div>
  );
}