import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'
import * as materiaService from '@/backend/services/materias'
import { GET, POST } from '@/backend/api/materias/route'
import { getMateriasMock, postMateriaMock } from '../../mocks/materia'
import { setCurrentRole } from '../../mocks/auth'
import { createRequest } from '../../mocks/requests'

vi.mock('@/backend/services/materias', () => ({
  getAllMaterias: vi.fn(),
  createMateria: vi.fn(),
}))

describe('GET /api/materias', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setCurrentRole(null);
  });

  it('should return materias from the service', async () => {
    (materiaService.getAllMaterias as Mock).mockResolvedValue(getMateriasMock);
    const response = await GET();
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual(getMateriasMock);
    expect(materiaService.getAllMaterias).toHaveBeenCalled();
  });
});

describe('POST /api/materias', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setCurrentRole(null); // Reset auth context
  });

  const createMateriaRequest = () => createRequest(postMateriaMock, "materia")

  it('should fail if unauthenticated', async () => {
    setCurrentRole(null);
    const response = await POST(createMateriaRequest());
    expect(response?.status).toBe(401);
  });

  it('should fail if user is not ADMIN or SUPER_ADMIN', async () => {
    setCurrentRole('USER');
    const response = await POST(createMateriaRequest());
    expect(response?.status).toBe(403);
  });

  it('should succeed if user is ADMIN', async () => {
    setCurrentRole('ADMIN');
    (materiaService.createMateria as Mock).mockResolvedValue(postMateriaMock);

    const response = await POST(createMateriaRequest());
    expect(response?.status).toBe(201);
    
    const data = await response?.json();
    expect(data).toEqual(postMateriaMock);
    expect(materiaService.createMateria).toHaveBeenCalledWith(postMateriaMock);
  });

  it('should succeed if user is SUPER_ADMIN', async () => {
    setCurrentRole('SUPER_ADMIN');
    (materiaService.createMateria as Mock).mockResolvedValue(postMateriaMock);

    const response = await POST(createMateriaRequest());
    expect(response?.status).toBe(201);
    
    const data = await response?.json();
    expect(data).toEqual(postMateriaMock);
    expect(materiaService.createMateria).toHaveBeenCalledWith(postMateriaMock);
  });
});