/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'
import * as materiaService from '@/backend/services/materias'
import { GET } from '@/backend/api/materias/[id]/route'
import { returnParams } from '../../../mocks/requests';

vi.mock('@/backend/services/materias', () => ({
  getMateriaById: vi.fn(),
}))

describe('GET /api/materias/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockRequest = {} as Request;
  const realParams = { id: '960bc679-2a96-4795-bed7-62c0a05996e0' };
  const fakeParams = { id: '960bc679-2a96-4795-bed7-aaaaaaaaaaaa' };

  it('should return materia if it exists', async () => {
    (materiaService.getMateriaById as Mock).mockResolvedValue(realParams);
    const response = await GET(mockRequest, returnParams(realParams) as any);
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual(realParams);
    expect(materiaService.getMateriaById).toHaveBeenCalled();
  });

  it('should throw 404 if nothing is found', async () => {
    (materiaService.getMateriaById as Mock).mockResolvedValue(null);
    const response = await GET(mockRequest, returnParams(fakeParams) as any);
    
    expect(response.status).toBe(404);
    expect(materiaService.getMateriaById).toHaveBeenCalled();
  });
});