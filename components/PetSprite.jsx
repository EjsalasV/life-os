"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import "./PetSprite.css";

const SPRITE = {
  frameWidth: 32,
  frameHeight: 32,
  offsetX: 0,
};

const CAT_SPRITES = {
  gatoNaranja: "/sprites/cat 1.9.png",
  gatoGris: "/sprites/cat 1.6.png",
  gatoBlanco: "/sprites/cat 1.png",
  conejo: "/sprites/bunny 1 16x16 animation.png",
  default: "/sprites/cat 16x16 with text.png",
};

const defaultAnimations = {
  idle: { row: 0, frames: 6, speed: "1.4s", loop: true },
  walkRight: { row: 6, frames: 8, speed: "1.1s", loop: true },
  walkLeft: { row: 7, frames: 8, speed: "1.1s", loop: true },
  sleep: { row: 14, frames: 2, speed: "1.8s", loop: true },
  eat: { row: 20, frames: 8, speed: "1.2s", loop: true },
  meow: { row: 28, frames: 3, speed: "0.9s", loop: false },
  wash: { row: 36, frames: 9, speed: "1.4s", loop: true },
  scratch: { row: 39, frames: 11, speed: "1.2s", loop: false },
};

const bunnyAnimations = {
  idle: { row: 1, frames: 6, speed: "1s", loop: true },
  walkRight: { row: 4, frames: 6, speed: "0.8s", loop: true },
  walkLeft: { row: 4, frames: 6, speed: "0.8s", loop: true },
  sleep: { row: 0, frames: 6, speed: "1.4s", loop: true },
  eat: { row: 3, frames: 6, speed: "1s", loop: true },
  meow: { row: 1, frames: 6, speed: "0.7s", loop: false },
  wash: { row: 3, frames: 6, speed: "1.2s", loop: true },
  scratch: { row: 2, frames: 6, speed: "1s", loop: false },
};

const behavior = {
  idle: ["idle", "idle", "walkRight", "walkLeft", "sleep", "eat", "meow", "wash"],
  walkRight: ["idle", "idle", "eat", "meow"],
  walkLeft: ["idle", "idle", "sleep", "wash"],
  sleep: ["idle", "meow"],
  eat: ["idle", "wash"],
  meow: ["idle"],
  wash: ["idle", "sleep"],
  scratch: ["idle"],
};

const triggerToAction = {
  run: "walkRight",
  walk: "walkRight",
  idle: "idle",
  sleep: "sleep",
};

function randomFrom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function durationForAction(action) {
  if (action === "idle") return randomBetween(2500, 6000);
  if (action === "walkRight" || action === "walkLeft") return randomBetween(900, 1800);
  if (action === "sleep") return randomBetween(5000, 12000);
  if (action === "eat") return randomBetween(3000, 7000);
  if (action === "wash") return randomBetween(3000, 8000);
  if (action === "meow" || action === "scratch") return randomBetween(1000, 2000);
  return 2000;
}

export default function PetSprite({
  type = "gatoNaranja",
  mood = "normal",
  hunger = 0,
  thirst = 0,
  energy = 70,
  eventType = "idle",
  eventNonce = 0,
  embedded = true,
  roam = 70,
  step = 36,
  scale = 3,
}) {
  const animationSet = type === "conejo" ? bunnyAnimations : defaultAnimations;
  const [action, setAction] = useState("idle");
  const [x, setX] = useState(0);
  const timeoutRef = useRef(null);
  const eventTimeoutRef = useRef(null);
  const inEventRef = useRef(false);

  function resolveBaseAction(currentAction) {
    if (energy < 20 || mood === "muerto") return "sleep";
    if (hunger > 75) return randomFrom(["eat", "eat", "idle", "walkRight"]);
    if (thirst > 75) return randomFrom(["meow", "idle", "walkLeft"]);
    if (mood === "triste") return randomFrom(["idle", "sleep", "walkLeft", "walkRight"]);
    if (mood === "feliz") return randomFrom(["walkRight", "walkLeft", "wash", "idle", "meow"]);
    if (mood === "extatico") return randomFrom(["walkRight", "walkRight", "wash", "scratch", "meow"]);
    const possibleActions = behavior[currentAction] || ["idle"];
    return randomFrom(possibleActions);
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
      }, durationForAction(newAction));
    };

    timeoutRef.current = setTimeout(() => {
      nextAction("idle");
    }, 2000);

    return () => clearTimer();
  }, [embedded, energy, hunger, mood, roam, step, thirst]);

  useEffect(() => {
    if (!eventNonce) return;
    if (eventTimeoutRef.current) clearTimeout(eventTimeoutRef.current);

    const eventToAnimation = {
      pet: type === "conejo" ? "wash" : "meow",
      play: Math.random() > 0.5 ? "walkRight" : "walkLeft",
      eat: "eat",
      drink: "meow",
      sleep: "sleep",
      walkLeft: "walkLeft",
      walkRight: "walkRight",
      idle: "idle",
    };
    const eventDuration = {
      pet: 900,
      play: 1200,
      eat: 1500,
      drink: 1000,
      sleep: 1800,
    };

    const mapped = eventToAnimation[eventType] || triggerToAction[eventType] || "idle";
    const safeMapped = animationSet[mapped] ? mapped : "idle";
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
    }, eventDuration[eventType] || 900);

    return () => {
      if (eventTimeoutRef.current) clearTimeout(eventTimeoutRef.current);
    };
  }, [eventNonce, eventType, mood, type, hunger, thirst, energy, roam, step, animationSet]);

  const current = useMemo(
    () => animationSet[action] || animationSet.idle,
    [action, animationSet]
  );
  const spritePath = CAT_SPRITES[type] || CAT_SPRITES.default;
  const wrapperTransform = embedded
    ? `translateX(calc(-50% + ${x}px))`
    : `translateX(${x}px)`;

  return (
    <div
      className={embedded ? "pet-sprite-wrapper pet-sprite-wrapper-embedded" : "pet-sprite-wrapper"}
      style={{ transform: wrapperTransform }}
    >
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
          "--cat-sprite-url": `url(\"${spritePath}\")`,
        }}
      />
    </div>
  );
}
