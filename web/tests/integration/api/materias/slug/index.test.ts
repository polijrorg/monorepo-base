/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'
import * as materiaService from '@/backend/services/materias'
import { GET } from '@/backend/api/materias/slug/[slug]/route'
import { returnParams } from '../../../mocks/requests';

vi.mock('@/backend/services/materias', () => ({
  getMateriaBySlug: vi.fn(),
}))

describe('GET /api/materias/slug/[slug]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockRequest = {} as Request;
  const realParams = { slug: 'verdadeiro' };
  const fakeParams = { slug: 'falso' };

  it('should return materia if it exists', async () => {
    (materiaService.getMateriaBySlug as Mock).mockResolvedValue(realParams);
    const response = await GET(mockRequest, returnParams(realParams) as any);
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual(realParams);
    expect(materiaService.getMateriaBySlug).toHaveBeenCalled();
  });

  it('should throw 404 if nothing is found', async () => {
    (materiaService.getMateriaBySlug as Mock).mockResolvedValue(null);
    const response = await GET(mockRequest, returnParams(fakeParams) as any);
    
    expect(response.status).toBe(404);
    expect(materiaService.getMateriaBySlug).toHaveBeenCalled();
  });
});