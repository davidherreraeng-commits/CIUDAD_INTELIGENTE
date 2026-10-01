// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';

const useAuthMock = vi.fn();

vi.mock('../src/provider/AuthProvider', () => ({
  useAuth: () => useAuthMock()
}));

import { usePermission } from '../src/hooks/usePermission.jsx';

describe('usePermission', () => {
  beforeEach(() => {
    useAuthMock.mockReset();
  });

  it('retorna false cuando no hay usuario autenticado', () => {
    useAuthMock.mockReturnValue({ authUser: null });

    const { result } = renderHook(() => usePermission());

    expect(result.current.hasPermission([1, 2])).toBe(false);
  });

  it('retorna false cuando authUser no tiene roleId', () => {
    useAuthMock.mockReturnValue({ authUser: { userId: 10 } });

    const { result } = renderHook(() => usePermission());

    expect(result.current.hasPermission([1, 2])).toBe(false);
  });

  it('retorna true cuando roleId está permitido', () => {
    useAuthMock.mockReturnValue({ authUser: { userId: 10, roleId: 2 } });

    const { result } = renderHook(() => usePermission());

    expect(result.current.hasPermission([1, 2])).toBe(true);
    expect(result.current.hasPermission([3, 4])).toBe(false);
  });
});
