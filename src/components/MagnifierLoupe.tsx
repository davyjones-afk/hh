import React, { useEffect, useState, useRef } from 'react';

interface MagnifierLoupeProps {
  active: boolean;
  zoom?: number;
  size?: number;
  targetContainerRef: React.RefObject<HTMLDivElement | null>;
  onClose: () => void;
}

export const MagnifierLoupe: React.FC<MagnifierLoupeProps> = ({
  active,
  zoom = 2.5,
  size = 200,
  targetContainerRef,
  onClose,
}) => {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [bgPos, setBgPos] = useState<string>('0% 0%');
  const [bgImage, setBgImage] = useState<string>('');

  useEffect(() => {
    if (!active || !targetContainerRef.current) {
      setPos(null);
      return;
    }

    const container = targetContainerRef.current;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
        setPos(null);
        return;
      }

      setPos({ x: e.clientX, y: e.clientY });

      // Find active visible comic image under cursor
      const element = document.elementFromPoint(e.clientX, e.clientY);
      const img = element instanceof HTMLImageElement ? element : (container.querySelector('img') as HTMLImageElement);

      if (img && img.src) {
        setBgImage(img.src);
        const imgRect = img.getBoundingClientRect();
        const imgX = ((e.clientX - imgRect.left) / imgRect.width) * 100;
        const imgY = ((e.clientY - imgRect.top) / imgRect.height) * 100;
        setBgPos(`${Math.max(0, Math.min(100, imgX))}% ${Math.max(0, Math.min(100, imgY))}%`);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key.toLowerCase() === 'z') {
        onClose();
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [active, targetContainerRef, onClose]);

  if (!active || !pos || !bgImage) return null;

  return (
    <div
      id="magnifier-loupe"
      className="pointer-events-none fixed z-50 rounded-full border-2 border-blue-500 bg-[#111] shadow-2xl shadow-black"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        left: `${pos.x - size / 2}px`,
        top: `${pos.y - size / 2}px`,
        backgroundImage: `url(${bgImage})`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: bgPos,
        backgroundSize: `${zoom * 100}%`,
      }}
    >
      <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-white/20" />
      {/* Center crosshair dot */}
      <div className="absolute top-1/2 left-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-400" />
    </div>
  );
};
