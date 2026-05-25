"use client";

import { useEffect, useState } from "react";
import "./PetBlink.css";

/**
 * PetBlink - Adds animated blinking eyes overlay to pets
 * Creates a natural blinking effect that makes the pet feel more alive
 */
export default function PetBlink({
  scale = 3,
  petType = "gato",
  isAlive = true,
}) {
  const [isBlinking, setIsBlinking] = useState(false);
  const [blinkFrame, setBlinkFrame] = useState(0);

  // Simulate blinking with random intervals
  useEffect(() => {
    if (!isAlive) return;

    // Blink every 2-6 seconds
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      let frame = 0;

      // Blink animation: 3 frames (open -> close -> open)
      const blinkTimer = setInterval(() => {
        frame++;
        setBlinkFrame(frame);

        if (frame >= 3) {
          setIsBlinking(false);
          clearInterval(blinkTimer);
        }
      }, 50); // 50ms per frame = 150ms total blink

      return () => clearInterval(blinkTimer);
    }, Math.random() * 4000 + 2000); // 2-6 second intervals

    return () => clearInterval(blinkInterval);
  }, [isAlive]);

  if (!isAlive) return null;

  // Eye positions vary by pet type
  const eyeConfig = {
    gato: { left: "35%", top: "25%", size: 4 },
    gatoNaranja: { left: "35%", top: "25%", size: 4 },
    gatoBlanco: { left: "35%", top: "25%", size: 4 },
    gatoGris: { left: "35%", top: "25%", size: 4 },
    conejo: { left: "35%", top: "35%", size: 5 },
  };

  const config = eyeConfig[petType] || eyeConfig.gato;

  return (
    <div
      className="pet-blink-container"
      style={{
        "--eye-scale": scale,
        "--eye-left": config.left,
        "--eye-top": config.top,
        "--eye-size": `${config.size}px`,
      }}
    >
      {/* Left Eye */}
      <div className={`pet-eye pet-eye-left ${isBlinking ? "blinking" : ""}`}>
        {blinkFrame === 0 && <span className="eye-pupil" />}
        {blinkFrame === 1 && <span className="eye-closed" />}
        {blinkFrame === 2 && <span className="eye-pupil" />}
      </div>

      {/* Right Eye */}
      <div className={`pet-eye pet-eye-right ${isBlinking ? "blinking" : ""}`}>
        {blinkFrame === 0 && <span className="eye-pupil" />}
        {blinkFrame === 1 && <span className="eye-closed" />}
        {blinkFrame === 2 && <span className="eye-pupil" />}
      </div>
    </div>
  );
}
