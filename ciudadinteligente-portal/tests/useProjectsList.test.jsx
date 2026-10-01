// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

vi.mock('../src/api/projects', () => ({
  projectsGetAll: vi.fn()
}));

import { projectsGetAll } from '../src/api/projects';
import { useProjectsList } from '../src/hooks/useProjectsList.jsx';

describe('useProjectsList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('carga proyectos y setea projectsList', async () => {
    projectsGetAll.mockResolvedValue({
      data: {
        projects: [{ projectsId: 1, name: 'Proyecto 1' }]
      }
    });

    const errorAlert = vi.fn();
    const { result } = renderHook(() => useProjectsList(errorAlert));

    await waitFor(() => {
      expect(result.current.projectsList).toEqual([{ projectsId: 1, name: 'Proyecto 1' }]);
    });

    expect(projectsGetAll).toHaveBeenCalledTimes(1);
    expect(errorAlert).not.toHaveBeenCalled();
  });

  it('llama errorAlert cuando falla la consulta', async () => {
    const err = new Error('network');
    projectsGetAll.mockRejectedValue(err);

    const errorAlert = vi.fn();
    renderHook(() => useProjectsList(errorAlert));

    await waitFor(() => {
      expect(errorAlert).toHaveBeenCalledWith('No se pudo consultar los proyectos', err);
    });
  });
});
