const SPRITE_PATHS = {
  gatoNaranja: "/sprites/cat 1.9.png",
  gatoGris: "/sprites/cat 1.6.png",
  gatoBlanco: "/sprites/cat 1.png",
  conejo: "/sprites/bunny 1 16x16 animation.png",
  default: "/sprites/cat 16x16 with text.png",
};

const catBlancoAnimations = {
  idle: { row: 0, frames: 6, speed: "1.4s", loop: true, sprite: "/sprites/cat-blanco/idle.png" },
  walkRight: { row: 0, frames: 8, speed: "1.1s", loop: true, sprite: "/sprites/cat-blanco/walk-right.png" },
  walkLeft: { row: 0, frames: 8, speed: "1.1s", loop: true, sprite: "/sprites/cat-blanco/walk-left.png" },
  sleep: { row: 0, frames: 2, speed: "1.8s", loop: true, sprite: "/sprites/cat-blanco/sleep.png" },
  eat: { row: 0, frames: 8, speed: "1.2s", loop: true, sprite: "/sprites/cat-blanco/eat.png" },
  meow: { row: 0, frames: 3, speed: "0.9s", loop: false, sprite: "/sprites/cat-blanco/meow.png" },
  wash: { row: 0, frames: 9, speed: "1.4s", loop: true, sprite: "/sprites/cat-blanco/wash.png" },
  scratch: { row: 0, frames: 9, speed: "1.2s", loop: false, sprite: "/sprites/cat-blanco/scratch.png" },
  sad: { row: 0, frames: 8, speed: "1.4s", loop: true, sprite: "/sprites/cat-blanco/sad.png" },
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

const behaviorGraph = {
  idle: ["idle", "idle", "walkRight", "walkLeft", "sleep", "eat", "meow", "wash"],
  walkRight: ["idle", "idle", "eat", "meow"],
  walkLeft: ["idle", "idle", "sleep", "wash"],
  sleep: ["idle", "meow"],
  eat: ["idle", "wash"],
  meow: ["idle"],
  wash: ["idle", "sleep"],
  scratch: ["idle"],
  sad: ["idle", "sleep", "meow"],
};

const futureActionFallbacks = {
  pawAttackDown: "scratch",
  pawAttackUp: "scratch",
  pawAttackLeft: "scratch",
  pawAttackRight: "scratch",
  pawAttackRightDown: "scratch",
  pawAttackLeftDown: "scratch",
  pawAttackRightUp: "scratch",
  pawAttackLeftUp: "scratch",
  onHindLegs: "meow",
  hiss1: "sad",
  hiss2: "sad",
  scratch1: "scratch",
  scratch2: "scratch",
};

const triggerToAction = {
  run: "walkRight",
  walk: "walkRight",
  idle: "idle",
  sleep: "sleep",
  paw: "pawAttackRight",
  hiss: "hiss1",
};

function randomFrom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getPetSpritePath(type) {
  return SPRITE_PATHS[type] || SPRITE_PATHS.default;
}

export function getPetAnimationSet(type) {
  if (type === "gatoBlanco") return catBlancoAnimations;
  if (type === "conejo") return bunnyAnimations;
  return defaultAnimations;
}

export function resolvePetAction(action, animationSet) {
  if (animationSet[action]) return action;
  const fallback = futureActionFallbacks[action] || triggerToAction[action];
  if (fallback && animationSet[fallback]) return fallback;
  return "idle";
}

export function decidePetIdleAction({ currentAction, mood, hunger, thirst, energy, animationSet }) {
  if (energy < 20 || mood === "muerto") return resolvePetAction("sleep", animationSet);
  if (hunger > 75) return resolvePetAction(randomFrom(["eat", "eat", "idle", "walkRight"]), animationSet);
  if (thirst > 75) return resolvePetAction(randomFrom(["meow", "sad", "idle", "walkLeft"]), animationSet);

  if (mood === "triste") {
    return resolvePetAction(randomFrom(["sad", "sad", "sleep", "idle"]), animationSet);
  }

  if (mood === "feliz") {
    return resolvePetAction(randomFrom(["walkRight", "walkLeft", "wash", "idle", "meow"]), animationSet);
  }

  if (mood === "extatico") {
    return resolvePetAction(randomFrom(["walkRight", "walkRight", "wash", "scratch", "meow"]), animationSet);
  }

  return resolvePetAction(randomFrom(behaviorGraph[currentAction] || ["idle"]), animationSet);
}

export function decidePetEventAction({ eventType, type, animationSet }) {
  const eventToAction = {
    pet: type === "conejo" ? "wash" : "meow",
    play: type === "gatoBlanco" ? randomFrom(["scratch", "walkRight", "walkLeft"]) : randomFrom(["walkRight", "walkLeft"]),
    eat: "eat",
    drink: "meow",
    sleep: "sleep",
    sad: "sad",
    hiss: "hiss1",
    paw: "pawAttackRight",
    walkLeft: "walkLeft",
    walkRight: "walkRight",
    idle: "idle",
  };

  return resolvePetAction(eventToAction[eventType] || triggerToAction[eventType] || "idle", animationSet);
}

export function getPetActionDuration(action) {
  if (action === "idle" || action === "sad") return randomBetween(2500, 6000);
  if (action === "walkRight" || action === "walkLeft") return randomBetween(900, 1800);
  if (action === "sleep") return randomBetween(5000, 12000);
  if (action === "eat") return randomBetween(3000, 7000);
  if (action === "wash") return randomBetween(3000, 8000);
  if (action === "meow" || action === "scratch") return randomBetween(1000, 2000);
  return 2000;
}

export function getPetEventDuration(eventType, action) {
  const durations = {
    pet: 900,
    play: action === "scratch" ? 1300 : 1200,
    eat: 1500,
    drink: 1000,
    sleep: 1800,
    hiss: 1200,
    paw: 1200,
  };

  return durations[eventType] || 900;
}

