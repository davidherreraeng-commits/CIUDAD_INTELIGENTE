import { describe, it, expect, vi, afterEach } from 'vitest';

import {
  authBackgroundImages,
  getRandomAuthBackground
} from '../src/utils/authBackgroundImages.js';

describe('authBackgroundImages', () => {
  const getRandomValuesSpy = vi.spyOn(globalThis.crypto, 'getRandomValues');

  afterEach(() => {
    getRandomValuesSpy.mockReset();
  });

  it('expone una lista no vacia de imagenes', () => {
    expect(Array.isArray(authBackgroundImages)).toBe(true);
    expect(authBackgroundImages.length).toBeGreaterThan(0);
  });

  it('getRandomAuthBackground retorna un elemento de la lista', () => {
    getRandomValuesSpy.mockImplementation((typedArray) => {
      typedArray[0] = 0;
      return typedArray;
    });
    expect(getRandomAuthBackground()).toBe(authBackgroundImages[0]);

    getRandomValuesSpy.mockImplementation((typedArray) => {
      typedArray[0] = authBackgroundImages.length - 1;
      return typedArray;
    });
    expect(getRandomAuthBackground()).toBe(authBackgroundImages[authBackgroundImages.length - 1]);
  });
});
