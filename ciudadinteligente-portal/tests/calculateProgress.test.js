import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { calculateProgress, calculateExecution } from '../src/utils/calculateProgress.jsx';

describe('calculateProgress', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-13T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('retorna 0 cuando faltan fechas', () => {
    expect(calculateProgress(null, '2026-06-01')).toBe(0);
    expect(calculateProgress('2026-05-01', null)).toBe(0);
  });

  it('retorna 0 cuando hoy es antes del inicio', () => {
    expect(calculateProgress('2026-05-14', '2026-05-20')).toBe(0);
    expect(calculateProgress('2026-05-20', '2026-06-01')).toBe(0);
  });

  it('retorna 100 cuando hoy es después o igual al fin', () => {
    expect(calculateProgress('2026-05-01', '2026-05-13')).toBe(100);
    expect(calculateProgress('2026-04-01', '2026-05-01')).toBe(100);
  });
});

describe('calculateExecution', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-13T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('retorna 0 cuando faltan fechas', () => {
    expect(calculateExecution(null, '2026-06-01', 1000)).toEqual({
      percentage: 0,
      executedValue: 0
    });
  });

  it('retorna 0 cuando no inicia', () => {
    expect(calculateExecution('2026-05-20', '2026-06-20', 1000)).toEqual({
      percentage: 0,
      executedValue: 0
    });
  });

  it('retorna 100 y valor completo cuando finalizó', () => {
    expect(calculateExecution('2026-04-01', '2026-05-01', 1000)).toEqual({
      percentage: 100,
      executedValue: 1000
    });
  });

  it('calcula porcentaje y valor ejecutado durante la vigencia', () => {
    const result = calculateExecution('2026-05-10', '2026-05-20', 1100);

    expect(result.percentage).toBe(45.45);
    expect(result.executedValue).toBe(500);
  });
});
