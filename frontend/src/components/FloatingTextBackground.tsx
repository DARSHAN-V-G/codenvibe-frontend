import { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  font: string;
  speed: number;
  opacity: number;
  rotation: number;
}

export function FloatingTextBackground() {
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  
  const texts = ["Debug", "Compile", "Run", "Fix", "Ship"];
  const fonts = ["'Playfair Display', serif", "'Great Vibes', cursive", "'Caveat', cursive"];

  useEffect(() => {
    // Create initial floating texts
    const initialTexts: FloatingText[] = [];
    for (let i = 0; i < 8; i++) {
      initialTexts.push({
        id: i,
        text: texts[Math.floor(Math.random() * texts.length)],
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        font: fonts[Math.floor(Math.random() * fonts.length)],
        speed: 15 + Math.random() * 15, // 15-30 range
        opacity: 0.15 + Math.random() * 0.2, // 0.15-0.35 range
        rotation: Math.random() * 360
      });
    }
    setFloatingTexts(initialTexts);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: -1 }}>
      {floatingTexts.map((item) => (
        <motion.div
          key={item.id}
          className="absolute text-6xl font-bold select-none"
          style={{
            fontFamily: item.font,
            color: 'rgba(255,255,255,0.07)',
            textShadow: '0 0 20px rgba(255,255,255,0.1)'
          }}
          initial={{
            x: item.x,
            y: item.y,
            opacity: 0,
            rotate: item.rotation,
            pathLength: 0
          }}
          animate={{
            x: [item.x, item.x + (Math.random() - 0.5) * 200, item.x + (Math.random() - 0.5) * 400],
            y: [item.y, item.y - 100, item.y - 200],
            opacity: [0, item.opacity, item.opacity, 0],
            rotate: [item.rotation, item.rotation + 10, item.rotation - 10],
            pathLength: [0, 1, 1, 1]
          }}
          transition={{
            duration: item.speed,
            repeat: Infinity,
            ease: "easeInOut",
            times: [0, 0.3, 0.7, 1]
          }}
        >
          {item.text}
        </motion.div>
      ))}
    </div>
  );
}