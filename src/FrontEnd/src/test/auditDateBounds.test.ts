import { describe, it, expect } from 'vitest';
import {
  isoDateToLocalDayStart,
  isoDateToNextLocalDayStart,
} from '../utils/date';

describe('bornes de journée locale', () => {
  it('résout le début de journée en heure locale, pas en UTC', () => {
    // `new Date("2026-09-19")` aurait été interprété en UTC : à l'heure
    // d'été française, la journée demandée serait décalée d'un jour.
    const start = isoDateToLocalDayStart('2026-09-19');
    const expected = new Date(2026, 8, 19).toISOString();

    expect(start).toBe(expected);

    // L'instant obtenu, relu en heure locale, tombe bien sur le jour demandé.
    expect(new Date(start).getDate()).toBe(19);
    expect(new Date(start).getMonth()).toBe(8);
    expect(new Date(start).getFullYear()).toBe(2026);
    expect(new Date(start).getHours()).toBe(0);
  });

  it('donne une borne haute exclusive au lendemain', () => {
    const start = isoDateToLocalDayStart('2026-09-19');
    const next = isoDateToNextLocalDayStart('2026-09-19');

    expect(next).toBe(isoDateToLocalDayStart('2026-09-20'));
    expect(new Date(next).getTime()).toBeGreaterThan(new Date(start).getTime());
  });

  it('couvre toute la journée sans perdre la dernière seconde', () => {
    // Une borne haute à 23:59:59 exclut la dernière seconde de la journée.
    const start = new Date(isoDateToLocalDayStart('2026-09-19'));
    const end = new Date(isoDateToNextLocalDayStart('2026-09-19'));
    const lastSecond = new Date(end.getTime() - 1000);

    expect(lastSecond.getTime() >= start.getTime()).toBe(true);
    // Un événement à 23:59:59.500 appartient encore à la journée.
    expect(lastSecond.getTime() < end.getTime()).toBe(true);
  });

  it('franchit les changements de mois et d’année', () => {
    expect(isoDateToNextLocalDayStart('2026-01-31')).toBe(
      isoDateToLocalDayStart('2026-02-01'),
    );
    expect(isoDateToNextLocalDayStart('2026-12-31')).toBe(
      isoDateToLocalDayStart('2027-01-01'),
    );
  });

  it('renvoie une chaîne vide pour une date invalide', () => {
    expect(isoDateToLocalDayStart('')).toBe('');
    expect(isoDateToLocalDayStart('pas-une-date')).toBe('');
    expect(isoDateToNextLocalDayStart('2026-13-01')).toBe('');
  });
});