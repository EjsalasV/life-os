"use client";

import { useState, useCallback } from "react";
import { PixelPet } from "@/components/PixelPet";
import styles from "./PetRoom.module.css";

interface PetPosition {
  x: number;
  y: number;
}

interface PetStats {
  hydration: number;    // 0-100
  energy: number;       // 0-100
  happiness: number;    // 0-100
  affection: number;    // 0-100
}

interface FurnitureItem {
  id: string;
  type: "water_bowl" | "food_bowl" | "toy";
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  image: string;
  action?: "drink" | "eat" | "play";
}

type AnimationType = "idle" | "walk_left" | "walk_right" | "eat_down" | "sleep";

export default function PetRoom() {
  // Estado del gato
  const [petPosition, setPetPosition] = useState<PetPosition>({
    x: 176,   // Centro horizontal
    y: 190,   // Posición inicial
  });

  const [currentAnimation, setCurrentAnimation] = useState<AnimationType>("idle");
  const [isMoving, setIsMoving] = useState(false);

  const [stats, setStats] = useState<PetStats>({
    hydration: 60,
    energy: 75,
    happiness: 80,
    affection: 50,
  });

  // Configuración de muebles
  const furniture: FurnitureItem[] = [
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

  /**
   * Mueve el gato hacia una coordenada con animación de caminar
   */
  const movePetToward = useCallback(
    (targetX: number, targetY: number): Promise<void> => {
      return new Promise((resolve) => {
        setIsMoving(true);

        // Determinar dirección de caminata
        const direction = targetX < petPosition.x ? "walk_left" : "walk_right";
        setCurrentAnimation(direction);

        // Simular movimiento paso a paso
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

  /**
   * Anima al gato realizando una acción (comer, beber, etc)
   */
  const performAction = useCallback(
    (action: "drink" | "eat" | "play", duration: number = 2000): Promise<void> => {
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

  /**
   * Maneja las acciones de hábitos del usuario
   */
  const handleHabitAction = useCallback(
    async (action: "drink" | "eat" | "play") => {
      if (isMoving) return; // Evitar acciones simultáneas

      let targetItem: FurnitureItem | undefined;
      let statUpdate: Partial<PetStats> = {};

      // Determinar mueble objetivo y actualización de stats
      if (action === "drink") {
        targetItem = furniture.find((f) => f.action === "drink");
        statUpdate = {
          hydration: Math.min(100, stats.hydration + 30),
          energy: Math.max(0, stats.energy - 5),
        };
      } else if (action === "eat") {
        targetItem = furniture.find((f) => f.action === "eat");
        statUpdate = {
          energy: Math.min(100, stats.energy + 25),
          happiness: Math.min(100, stats.happiness + 10),
        };
      } else if (action === "play") {
        targetItem = furniture.find((f) => f.action === "play");
        statUpdate = {
          happiness: Math.min(100, stats.happiness + 40),
          energy: Math.max(0, stats.energy - 20),
          affection: Math.min(100, stats.affection + 15),
        };
      }

      if (!targetItem) return;

      // 1. Mover gato hacia el objeto
      await movePetToward(targetItem.x, targetItem.y);

      // 2. Realizar la acción (animación)
      await performAction(action, 2000);

      // 3. Actualizar stats
      setStats((prev) => ({
        hydration: statUpdate.hydration ?? prev.hydration,
        energy: statUpdate.energy ?? prev.energy,
        happiness: statUpdate.happiness ?? prev.happiness,
        affection: statUpdate.affection ?? prev.affection,
      }));

      // 4. Volver a centro (opcional, descomentar si lo prefieres)
      // await movePetToward(176, 190);
    },
    [stats, isMoving, movePetToward, performAction, furniture]
  );

  return (
    <div className={styles.petRoomWrapper}>
      {/* Contenedor responsivo de la habitación */}
      <div className={styles.petRoomContainer}>
        {/* Fondo de la habitación */}
        <div className={styles.petRoomBackground}>
          {/* Barras de stats dentro de la habitación */}
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

          {/* Muebles */}
          {furniture.map((item) => (
            <div
              key={item.id}
              className={styles.furnitureItem}
              style={{
                left: `${(item.x / 384) * 100}%`,
                top: `${(item.y / 288) * 100}%`,
                width: `${(item.width / 384) * 100}%`,
                aspectRatio: `${item.width} / ${item.height}`,
              }}
              title={item.label}
            >
              <img
                src={item.image}
                alt={item.label}
                className={styles.furnitureImage}
              />
            </div>
          ))}

          {/* Gato animado */}
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
        </div>
      </div>

      {/* Botones de acciones */}
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
      </div>

      {/* Debug */}
      <div className={styles.debug}>
        <p>
          Pos: ({Math.round(petPosition.x)}, {Math.round(petPosition.y)}) | Anim:{" "}
          {currentAnimation}
        </p>
      </div>
    </div>
  );
}
