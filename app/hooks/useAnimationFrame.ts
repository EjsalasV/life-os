import { useEffect, useState } from 'react';

/**
 * Hook que proporciona un frame de animación 0-59 sincronizado
 * Se usa para animar partes del pixel art (ojos, cola, orejas, etc)
 *
 * @param speed - Multiplicador de velocidad (default: 1)
 * @returns frame actual (0-59)
 */
export function useAnimationFrame(speed: number = 1): number {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    let animationId: number;
    let lastTime = Date.now();

    const updateFrame = () => {
      const now = Date.now();
      const delta = (now - lastTime) / 16.67; // ~60fps en ms
      lastTime = now;

      setFrame((prevFrame) => {
        const newFrame = (prevFrame + speed * delta) % 60;
        return newFrame;
      });

      animationId = requestAnimationFrame(updateFrame);
    };

    animationId = requestAnimationFrame(updateFrame);

    return () => cancelAnimationFrame(animationId);
  }, [speed]);

  return Math.floor(frame);
}
