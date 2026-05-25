"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  decidePetEventAction,
  decidePetIdleAction,
  getPetActionDuration,
  getPetAnimationSet,
  getPetEventDuration,
  getPetSpritePath,
} from "@/app/lib/petBrain";
import PetBlink from "./PetBlink";
import "./PetSprite.css";

const SPRITE = {
  frameWidth: 32,
  frameHeight: 32,
  offsetX: 0,
};

export default function PetSprite({
  type = "gatoNaranja",
  mood = "normal",
  hunger = 0,
  thirst = 0,
  energy = 70,
  eventType = "idle",
  eventNonce = 0,
  embedded = true,
  embeddedLeftPct = 50,
  embeddedTopPct,
  embeddedBottomPct = 16,
  roam = 70,
  step = 36,
  scale = 3,
}) {
  const animationSet = useMemo(() => getPetAnimationSet(type), [type]);
  const [action, setAction] = useState("idle");
  const [x, setX] = useState(0);
  const timeoutRef = useRef(null);
  const eventTimeoutRef = useRef(null);
  const inEventRef = useRef(false);

  function resolveBaseAction(currentAction) {
    return decidePetIdleAction({
      currentAction,
      mood,
      hunger,
      thirst,
      energy,
      animationSet,
    });
  }

  useEffect(() => {
    const clearTimer = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };

    const nextAction = (currentAction) => {
      if (inEventRef.current) {
        timeoutRef.current = setTimeout(() => nextAction(currentAction), 900);
        return;
      }
      const newAction = resolveBaseAction(currentAction);
      setAction(newAction);

      if (newAction === "walkRight") {
        setX((currentX) => {
          const maxBound = embedded ? roam : Math.max(40, (window?.innerWidth || 1024) - 120);
          return Math.min(currentX + step, maxBound);
        });
      }

      if (newAction === "walkLeft") {
        setX((currentX) => {
          const minBound = embedded ? -roam : 20;
          return Math.max(currentX - step, minBound);
        });
      }
      if (newAction !== "walkLeft" && newAction !== "walkRight") {
        setX((currentX) => {
          if (Math.abs(currentX) < 3) return 0;
          return Math.round(currentX * 0.7);
        });
      }

      timeoutRef.current = setTimeout(() => {
        nextAction(newAction);
      }, getPetActionDuration(newAction));
    };

    timeoutRef.current = setTimeout(() => {
      nextAction("idle");
    }, 2000);

    return () => clearTimer();
  }, [animationSet, embedded, energy, hunger, mood, roam, step, thirst]);

  useEffect(() => {
    if (!eventNonce) return;
    if (eventTimeoutRef.current) clearTimeout(eventTimeoutRef.current);

    const safeMapped = decidePetEventAction({ eventType, type, animationSet });
    inEventRef.current = true;
    setAction(safeMapped);

    if (safeMapped === "walkRight") {
      setX((currentX) => Math.min(currentX + step, roam));
    }
    if (safeMapped === "walkLeft") {
      setX((currentX) => Math.max(currentX - step, -roam));
    }

    eventTimeoutRef.current = setTimeout(() => {
      inEventRef.current = false;
      setAction((currentAction) => resolveBaseAction(currentAction));
    }, getPetEventDuration(eventType, safeMapped));

    return () => {
      if (eventTimeoutRef.current) clearTimeout(eventTimeoutRef.current);
    };
  }, [eventNonce, eventType, mood, type, hunger, thirst, energy, roam, step, animationSet]);

  const current = useMemo(
    () => animationSet[action] || animationSet.idle,
    [action, animationSet]
  );
  const spritePath = getPetSpritePath(type);
  const currentSpritePath = current.sprite || spritePath;
  const wrapperTransform = embedded
    ? `translateX(calc(-50% + ${x}px))`
    : `translateX(${x}px)`;
  const wrapperStyle = embedded
    ? {
        transform: wrapperTransform,
        left: `${embeddedLeftPct}%`,
        ...(typeof embeddedTopPct === "number"
          ? { top: `${embeddedTopPct}%`, bottom: "auto" }
          : { bottom: `${embeddedBottomPct}%` })
      }
    : { transform: wrapperTransform };

  return (
    <div
      className={embedded ? "pet-sprite-wrapper pet-sprite-wrapper-embedded" : "pet-sprite-wrapper"}
      style={wrapperStyle}
    >
      <div style={{ position: "relative", display: "inline-block" }}>
        <div
          className="pet-sprite"
          style={{
            "--frame-width": `${SPRITE.frameWidth}px`,
            "--frame-height": `${SPRITE.frameHeight}px`,
            "--frame-offset-x": `${SPRITE.offsetX}px`,
            "--row": current.row,
            "--frames": current.frames,
            "--speed": current.speed,
            "--loop": current.loop ? "infinite" : "1",
            "--cat-scale": scale,
            "--cat-sprite-url": `url(\"${currentSpritePath}\")`,
          }}
        />
        {/* Add blinking eyes overlay */}
        <PetBlink
          scale={scale}
          petType={type}
          isAlive={action !== "muerto"}
        />
      </div>
    </div>
  );
}
