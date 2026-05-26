"use client";

import { useState } from "react";
import styles from "./PetRoom.module.css";

interface PetPosition {
  x: number;
  y: number;
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
  action?: "drink" | "eat" | "play"; // Para interacciones futuras
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
      id: "water_bowl",
      type: "water_bowl",
      x: 165,     // Centro-izquierda inferior
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
      x: 205,     // Centro-derecha inferior
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
      x: 305,     // Derecha intermedia
      y: 230,
      width: 32,
      height: 16,
      image: "/furniture/toy.png",
      label: "Juguete",
      action: "play",
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

          {/* Muebles (imágenes reales) */}
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
              data-action={item.action}
            >
              {/* Imagen del mueble */}
              <img
                src={item.image}
                alt={item.label}
                className={styles.furnitureImage}
              />
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
        <button
          onClick={() => movePetTo(165, 245)}
          className={styles.button}
          title="Acción: Tomé agua"
        >
          💧 Agua (165, 245)
        </button>
        <button
          onClick={() => movePetTo(205, 245)}
          className={styles.button}
          title="Acción: Registré comida"
        >
          🍗 Comida (205, 245)
        </button>
        <button
          onClick={() => movePetTo(305, 230)}
          className={styles.button}
          title="Acción: Jugar / hice actividad"
        >
          🎮 Juguete (305, 230)
        </button>
        <button onClick={resetPet} className={`${styles.button} ${styles.buttonReset}`}>
          🏠 Centro
        </button>
      </div>

      {/* Información de posición (debug) */}
      <div className={styles.debug}>
        <p>Posición gato: x={petPosition.x}, y={petPosition.y}</p>
      </div>
    </div>
  );
}
