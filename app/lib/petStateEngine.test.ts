import { describe, expect, it } from "vitest";

import {
  applyPetEvent,
  applyDecayTick,
  createInitialPet,
  syncDailyPetState
} from "@/app/lib/petStateEngine";

describe("petStateEngine", () => {
  it("acumula varios dias de abandono al reabrir la app", () => {
    const pet = {
      ...createInitialPet("2026-08-01T10:00:00.000Z"),
      salud: 80,
      felicidad: 90,
      energia: 90,
      hambre: 10,
      sed: 15,
      diasSinActividad: 0,
      lastDailyResetAt: "2026-08-01T10:00:00.000Z",
      lastDecayAt: "2026-08-01T10:00:00.000Z"
    };

    const synced = syncDailyPetState(pet, "2026-08-06T12:00:00.000Z");

    expect(synced.diasSinActividad).toBe(5);
    expect(synced.hambre).toBe(100);
    expect(synced.sed).toBe(100);
    expect(synced.salud).toBe(65);
    expect(synced.felicidad).toBe(50);
    expect(synced.energia).toBe(40);
    expect(synced.actividadHoy.agua).toBe(0);
    expect(synced.actividadHoy.comidas).toBe(0);
  });

  it("limita el catch-up para no destruir stats tras ausencias muy largas", () => {
    const pet = {
      ...createInitialPet("2026-08-01T10:00:00.000Z"),
      salud: 100,
      felicidad: 100,
      energia: 100,
      hambre: 0,
      sed: 0,
      lastDailyResetAt: "2026-08-01T10:00:00.000Z",
      lastDecayAt: "2026-08-01T10:00:00.000Z"
    };

    const synced = syncDailyPetState(pet, "2026-08-22T09:00:00.000Z");

    expect(synced.diasSinActividad).toBe(21);
    expect(synced.salud).toBe(85);
    expect(synced.felicidad).toBe(60);
    expect(synced.energia).toBe(50);
    expect(synced.hambre).toBe(100);
    expect(synced.sed).toBe(100);
  });

  it("no incrementa diasSinActividad varias veces en el mismo dia por el tick de 6 horas", () => {
    const pet = {
      ...createInitialPet("2026-08-22T08:00:00"),
      diasSinActividad: 2,
      lastDailyResetAt: "2026-08-22T08:00:00",
      lastDecayAt: "2026-08-22T08:00:00"
    };

    const decayed = applyDecayTick(pet, "2026-08-22T15:00:00");

    expect(decayed.diasSinActividad).toBe(2);
    expect(decayed.lastDecayAt).toBe("2026-08-22T15:00:00");
    expect(decayed.hambre).toBe(80);
    expect(decayed.sed).toBe(78);
  });

  it("usa el motor central para agua, comida, jugar y dormir", () => {
    const base = {
      ...createInitialPet("2026-08-22T08:00:00.000Z"),
      salud: 60,
      felicidad: 50,
      energia: 40,
      hambre: 80,
      sed: 90
    };

    const agua = applyPetEvent(base, { type: "drink_water" }, "2026-08-22T09:00:00.000Z");
    expect(agua.sed).toBe(70);
    expect(agua.salud).toBe(65);
    expect(agua.actividadHoy.agua).toBe(1);

    const comida = applyPetEvent(base, { type: "eat_food", macrosOK: true, calorias: 400 }, "2026-08-22T09:00:00.000Z");
    expect(comida.hambre).toBe(55);
    expect(comida.salud).toBe(68);
    expect(comida.energia).toBe(42);
    expect(comida.actividadHoy.comidas).toBe(1);

    const juego = applyPetEvent(base, { type: "play" }, "2026-08-22T09:00:00.000Z");
    expect(juego.felicidad).toBe(65);
    expect(juego.energia).toBe(30);
    expect(juego.salud).toBe(65);

    const dormir = applyPetEvent(base, { type: "sleep" }, "2026-08-22T09:00:00.000Z");
    expect(dormir.energia).toBe(70);
    expect(dormir.salud).toBe(65);
    expect(dormir.actividadHoy.habitos).toBe(1);
  });
});
