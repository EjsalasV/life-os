"use client";

import { useState } from "react";
import styles from "./PetRoom.module.css";

interface PetPosition {
  x: number;
  y: number;
}

interface FurnitureItem {
  id: string;
  type: "bed" | "bowl" | "toy";
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
}

export default function PetRoom() {
  // Posición del gato (coordenadas en px de la habitación 384x288)
  const [petPosition, setPetPosition] = useState<PetPosition>({
    x: 176, // Centro horizontal (384/2 - 16 = 176)
    y: 144, // Centro vertical (288/2 - 16 = 144)
  });

  // Muebles estáticos en la habitación
  const furniture: FurnitureItem[] = [
    {
      id: "bed",
      type: "bed",
      x: 32,      // Esquina inferior izquierda
      y: 240,
      width: 64,
      height: 48,
      label: "Cama",
    },
    {
      id: "bowl",
      type: "bowl",
      x: 176,     // Centro inferior
      y: 256,
      width: 32,
      height: 16,
      label: "Plato",
    },
    {
      id: "toy",
      type: "toy",
      x: 320,     // Esquina derecha
      y: 160,
      width: 32,
      height: 32,
      label: "Juguete",
    },
  ];

  // Función para mover el gato a una ubicación
  const movePetTo = (x: number, y: number) => {
    setPetPosition({ x, y });
  };

  // Función para mover el gato al centro
  const resetPet = () => {
    setPetPosition({ x: 176, y: 144 });
  };

  return (
    <div className={styles.petRoomWrapper}>
      {/* Contenedor responsivo de la habitación */}
      <div className={styles.petRoomContainer}>

        {/* Fondo de la habitación (384x288 sin deformar) */}
        <div className={styles.petRoomBackground}>

          {/* Muebles (imágenes independientes) */}
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
              {/* Placeholder de mueble */}
              <div className={styles.furniturePlaceholder}>
                {item.type === "bed" && "🛏️"}
                {item.type === "bowl" && "🍗"}
                {item.type === "toy" && "🎮"}
              </div>
            </div>
          ))}

          {/* Gato (32x32 px) */}
          <div
            className={styles.petSprite}
            style={{
              left: `${(petPosition.x / 384) * 100}%`,
              top: `${(petPosition.y / 288) * 100}%`,
            }}
          >
            {/* Placeholder del gato (32x32) */}
            <div className={styles.petSpriteImage}>🐱</div>
          </div>

        </div>
      </div>

      {/* Controles para demostración */}
      <div className={styles.controls}>
        <button onClick={() => movePetTo(32, 240)} className={styles.button}>
          Ir a la cama
        </button>
        <button onClick={() => movePetTo(176, 256)} className={styles.button}>
          Ir al plato
        </button>
        <button onClick={() => movePetTo(320, 160)} className={styles.button}>
          Ir al juguete
        </button>
        <button onClick={resetPet} className={`${styles.button} ${styles.buttonReset}`}>
          Centro
        </button>
      </div>

      {/* Información de posición (debug) */}
      <div className={styles.debug}>
        <p>Posición gato: x={petPosition.x}, y={petPosition.y}</p>
      </div>
    </div>
  );
}
