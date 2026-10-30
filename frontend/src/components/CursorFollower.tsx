import React, { useEffect, useState } from 'react';
import { motion, useSpring } from 'motion/react';

export default function CursorFollower() {
  const [cursorText, setCursorText] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const springConfig = { damping: 25, stiffness: 350 };
  const cursorX = useSpring(-100, springConfig);
  const cursorY = useSpring(-100, springConfig);

  useEffect(() => {
    // Only enable on fine pointer devices (desktop/mouse)
    const mediaQuery = window.matchMedia('(pointer: fine)');
    if (!mediaQuery.matches) return;

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('[data-cursor]');
      if (target) {
        const text = target.getAttribute('data-cursor');
        setCursorText(text || null);
        setIsHovered(true);
      } else {
        const isClickable = (e.target as HTMLElement).closest('button, a, input, select, textarea, [role="button"]');
        if (isClickable) {
          setIsHovered(true);
          setCursorText(null);
        } else {
          setIsHovered(false);
          setCursorText(null);
        }
      }
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener('mousemove', moveCursor);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [cursorX, cursorY, isVisible]);

  if (!isVisible) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-[9999] flex items-center justify-center -translate-x-1/2 -translate-y-1/2"
      style={{
        x: cursorX,
        y: cursorY,
      }}
    >
      <motion.div
        animate={{
          width: cursorText ? 84 : isHovered ? 48 : 12,
          height: cursorText ? 84 : isHovered ? 48 : 12,
          backgroundColor: cursorText ? 'rgba(0, 102, 255, 0.9)' : isHovered ? 'rgba(0, 102, 255, 0.2)' : 'rgba(0, 102, 255, 0.8)',
          borderColor: isHovered ? 'rgba(0, 102, 255, 0.6)' : 'transparent',
          borderWidth: isHovered && !cursorText ? 1.5 : 0,
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        className="rounded-full flex items-center justify-center backdrop-blur-[2px] shadow-lg shadow-blue-500/20"
      >
        {cursorText && (
          <span className="text-[11px] font-bold text-white tracking-wider uppercase select-none px-2 text-center">
            {cursorText}
          </span>
        )}
      </motion.div>
    </motion.div>
  );
}
