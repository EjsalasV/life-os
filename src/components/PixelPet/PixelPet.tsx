"use client";

import { useState, useEffect } from "react";
import styles from "./PixelPet.module.css";

export interface AnimationConfig {
  src: string;
  frames: number;
  duration: number; // ms per frame
  loop: boolean;
}

export interface PixelPetProps {
  x: number;              // Coordenada X en habitación base (0-384)
  y: number;              // Coordenada Y en habitación base (0-288)
  animation: keyof typeof ANIMATIONS;
  scale?: number;         // Escala visual del gato
  onAnimationEnd?: () => void;
}

// Configuración de todas las animaciones
const ANIMATIONS = {
  idle: {
    src: "/pets/cat/idle.png",
    frames: 2,
    duration: 400,
    loop: true,
  } as AnimationConfig,
  walk_left: {
    src: "/pets/cat/walk_left.png",
    frames: 4,
    duration: 100,
    loop: false,
  } as AnimationConfig,
  walk_right: {
    src: "/pets/cat/walk_right.png",
    frames: 4,
    duration: 100,
    loop: false,
  } as AnimationConfig,
  eat_down: {
    src: "/pets/cat/eat_down.png",
    frames: 3,
    duration: 150,
    loop: true,
  } as AnimationConfig,
  sleep: {
    src: "/pets/cat/sleep.png",
    frames: 2,
    duration: 500,
    loop: true,
  } as AnimationConfig,
};

export default function PixelPet({
  x,
  y,
  animation = "idle",
  scale = 3,
  onAnimationEnd,
}: PixelPetProps) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const config = ANIMATIONS[animation];

  // Animar frames
  useEffect(() => {
    if (!config) return;

    const interval = setInterval(() => {
      setCurrentFrame((prev) => {
        const nextFrame = (prev + 1) % config.frames;

        // Ejecutar callback cuando termina la animación (solo si no es loop)
        if (!config.loop && nextFrame === 0) {
          onAnimationEnd?.();
        }

        return nextFrame;
      });
    }, config.duration);

    return () => clearInterval(interval);
  }, [config, onAnimationEnd]);

  // Convertir coordenadas base a porcentaje
  const leftPercent = (x / 384) * 100;
  const topPercent = (y / 288) * 100;

  // Calcular offset de background para el frame actual
  // Cada frame ocupa 32px horizontalmente
  const backgroundPositionX = currentFrame * -32;

  return (
    <div
      className={styles.petContainer}
      style={{
        left: `${leftPercent}%`,
        top: `${topPercent}%`,
        transform: `translate(-50%, -50%) scale(${scale})`,
      }}
    >
      <div
        className={styles.petSprite}
        style={{
          backgroundImage: `url(${config.src})`,
          backgroundPosition: `${backgroundPositionX}px 0`,
        }}
      />
    </div>
  );
}
