"use client";

import { useState, useCallback, useEffect } from "react";
import { PixelPet } from "@/src/components/PixelPet";
import styles from "./PetRoom.module.css";

interface PetPosition {
  x: number;
  y: number;
}

interface PetStats {
  hydration: number;
  energy: number;
  happiness: number;
  affection: number;
}

const INTERACTION_POINTS = {
  drink: { x: 165, y: 213 },
  eat: { x: 205, y: 213 },
  play: { x: 305, y: 200 },
  sleep: { x: 48, y: 195 },
};

interface FurnitureItem {
  id: string;
  type: "bed" | "water_bowl" | "food_bowl" | "toy";
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  image: string;
  action?: "drink" | "eat" | "play" | "sleep";
}

type AnimationType = "idle" | "walk_left" | "walk_right" | "eat_down" | "sleep";

export default function PetRoom() {
  const [petPosition, setPetPosition] = useState<PetPosition>({
    x: 176,
    y: 190,
  });

  const [currentAnimation, setCurrentAnimation] = useState<AnimationType>("idle");
  const [isMoving, setIsMoving] = useState(false);

  const [stats, setStats] = useState<PetStats>({
    hydration: 60,
    energy: 75,
    happiness: 80,
    affection: 50,
  });

  const furniture: FurnitureItem[] = [
    {
      id: "bed",
      type: "bed",
      x: 32,
      y: 220,
      width: 64,
      height: 48,
      image: "/furniture/bed.png",
      label: "Cama",
      action: "sleep",
    },
    {
      id: "water_bowl",
      type: "water_bowl",
      x: 165,
      y: 245,
      width: 32,
      height: 16,
      image: "/furniture/water_bowl.png",
      label: "Agua",
      action: "drink",
    },
    {
      id: "food_bowl",
      type: "food_bowl",
      x: 205,
      y: 245,
      width: 32,
      height: 16,
      image: "/furniture/food_bowl.png",
      label: "Comida",
      action: "eat",
    },
    {
      id: "toy",
      type: "toy",
      x: 305,
      y: 230,
      width: 32,
      height: 16,
      image: "/furniture/toy.png",
      label: "Juguete",
      action: "play",
    },
  ];

  const movePetToward = useCallback(
    (targetX: number, targetY: number): Promise<void> => {
      return new Promise((resolve) => {
        setIsMoving(true);
        const direction = targetX < petPosition.x ? "walk_left" : "walk_right";
        setCurrentAnimation(direction);

        const steps = 5;
        let currentStep = 0;

        const moveInterval = setInterval(() => {
          currentStep++;
          const progress = currentStep / steps;

          setPetPosition({
            x: petPosition.x + (targetX - petPosition.x) * progress,
            y: petPosition.y + (targetY - petPosition.y) * progress,
          });

          if (currentStep >= steps) {
            clearInterval(moveInterval);
            setPetPosition({ x: targetX, y: targetY });
            setIsMoving(false);
            resolve();
          }
        }, 100);
      });
    },
    [petPosition]
  );

  const performAction = useCallback(
    (action: "drink" | "eat" | "play" | "sleep", duration: number = 2000): Promise<void> => {
      return new Promise((resolve) => {
        setCurrentAnimation("eat_down");

        setTimeout(() => {
          setCurrentAnimation("idle");
          resolve();
        }, duration);
      });
    },
    []
  );

  const handleHabitAction = useCallback(
    async (action: "drink" | "eat" | "play" | "sleep") => {
      if (isMoving) return;

      let targetItem: FurnitureItem | undefined;
      let interactionPoint: { x: number; y: number } | undefined;
      let statUpdate: Partial<PetStats> = {};
      let animationDuration = 2000;

      if (action === "drink") {
        targetItem = furniture.find((f) => f.action === "drink");
        interactionPoint = INTERACTION_POINTS.drink;
        statUpdate = {
          hydration: Math.min(100, stats.hydration + 30),
          energy: Math.max(0, stats.energy - 5),
        };
      } else if (action === "eat") {
        targetItem = furniture.find((f) => f.action === "eat");
        interactionPoint = INTERACTION_POINTS.eat;
        statUpdate = {
          energy: Math.min(100, stats.energy + 25),
          happiness: Math.min(100, stats.happiness + 10),
        };
      } else if (action === "play") {
        targetItem = furniture.find((f) => f.action === "play");
        interactionPoint = INTERACTION_POINTS.play;
        statUpdate = {
          happiness: Math.min(100, stats.happiness + 40),
          energy: Math.max(0, stats.energy - 20),
          affection: Math.min(100, stats.affection + 15),
        };
      } else if (action === "sleep") {
        targetItem = furniture.find((f) => f.action === "sleep");
        interactionPoint = INTERACTION_POINTS.sleep;
        statUpdate = {
          energy: Math.min(100, stats.energy + 50),
          affection: Math.min(100, stats.affection + 5),
        };
        animationDuration = 3000;
      }

      if (!targetItem || !interactionPoint) return;

      await movePetToward(interactionPoint.x, interactionPoint.y);
      await performAction(action, animationDuration);

      setStats((prev) => ({
        hydration: statUpdate.hydration ?? prev.hydration,
        energy: statUpdate.energy ?? prev.energy,
        happiness: statUpdate.happiness ?? prev.happiness,
        affection: statUpdate.affection ?? prev.affection,
      }));
    },
    [stats, isMoving, movePetToward, performAction, furniture]
  );

  useEffect(() => {
    const saved = localStorage.getItem("petStats");
    if (saved) {
      try {
        setStats(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading stats:", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("petStats", JSON.stringify(stats));
  }, [stats]);

  return (
    <div className={styles.petRoomWrapper}>
      <div className={styles.petRoomContainer}>
        {/* FONDO - usando <img> para debug */}
        <img
          src="/room/room_background.png"
          alt="Habitación"
          className={styles.roomBackground}
        />

        {/* MUEBLES - usando <img> para debug */}
        {furniture.map((item) => (
          <img
            key={item.id}
            src={item.image}
            alt={item.label}
            className={styles.furnitureItem}
            style={{
              left: `${(item.x / 384) * 100}%`,
              top: `${(item.y / 288) * 100}%`,
              width: `${(item.width / 384) * 100}%`,
              aspectRatio: `${item.width} / ${item.height}`,
            }}
            title={item.label}
          />
        ))}

        {/* GATO */}
        <PixelPet
          x={petPosition.x}
          y={petPosition.y}
          animation={currentAnimation}
          scale={3}
          onAnimationEnd={() => {
            if (currentAnimation !== "idle") {
              setCurrentAnimation("idle");
            }
          }}
        />

        {/* STATS PANEL */}
        <div className={styles.statsPanel}>
          <div className={styles.statBar}>
            <span className={styles.statIcon}>💧</span>
            <div className={styles.statBarBg}>
              <div
                className={styles.statBarFill}
                style={{ width: `${stats.hydration}%`, backgroundColor: "#3b82f6" }}
              />
            </div>
            <span className={styles.statValue}>{Math.round(stats.hydration)}</span>
          </div>
          <div className={styles.statBar}>
            <span className={styles.statIcon}>⚡</span>
            <div className={styles.statBarBg}>
              <div
                className={styles.statBarFill}
                style={{ width: `${stats.energy}%`, backgroundColor: "#fbbf24" }}
              />
            </div>
            <span className={styles.statValue}>{Math.round(stats.energy)}</span>
          </div>
          <div className={styles.statBar}>
            <span className={styles.statIcon}>😊</span>
            <div className={styles.statBarBg}>
              <div
                className={styles.statBarFill}
                style={{ width: `${stats.happiness}%`, backgroundColor: "#ec4899" }}
              />
            </div>
            <span className={styles.statValue}>{Math.round(stats.happiness)}</span>
          </div>
          <div className={styles.statBar}>
            <span className={styles.statIcon}>💕</span>
            <div className={styles.statBarBg}>
              <div
                className={styles.statBarFill}
                style={{ width: `${stats.affection}%`, backgroundColor: "#f43f5e" }}
              />
            </div>
            <span className={styles.statValue}>{Math.round(stats.affection)}</span>
          </div>
        </div>
      </div>

      {/* BOTONES */}
      <div className={styles.controls}>
        <button
          onClick={() => handleHabitAction("drink")}
          className={styles.button}
          disabled={isMoving}
        >
          💧 Tomé agua
        </button>
        <button
          onClick={() => handleHabitAction("eat")}
          className={styles.button}
          disabled={isMoving}
        >
          🍽️ Registré comida
        </button>
        <button
          onClick={() => handleHabitAction("play")}
          className={styles.button}
          disabled={isMoving}
        >
          🎮 Hice actividad
        </button>
        <button
          onClick={() => handleHabitAction("sleep")}
          className={styles.button}
          disabled={isMoving}
        >
          😴 Dormí bien
        </button>
      </div>

      {/* DEBUG INFO */}
      <div className={styles.debug}>
        <p>
          Pos: ({Math.round(petPosition.x)}, {Math.round(petPosition.y)}) | Anim: {currentAnimation}
        </p>
        <p style={{ fontSize: "0.7rem", color: "#999", marginTop: "0.25rem" }}>
          🔵 Azul=Fondo | 🟢 Verde=Muebles | 🔴 Rojo=Gato | 📊 Stats=Arriba
        </p>
      </div>
    </div>
  );
}
