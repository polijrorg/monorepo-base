import { describe, it, vi, beforeEach, expect, Mock } from "vitest";
import * as userService from '@/backend/services/users'
import { postUserMock } from "../../mocks/user";
import { createRequest } from "../../mocks/requests";
import { auth } from "@/auth";

vi.mock('@/backend/services/users', () => ({
  findUserByEmail: vi.fn(),
}))

vi.mock('@/auth', () => ({
  auth: vi.fn()
}))

import { POST } from '@/backend/api/users/route'

describe('POST /api/users', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createUserRequest = () => createRequest(postUserMock, 'users')

  it("should fail if there's another user with the same email", async () => {
    (userService.findUserByEmail as Mock).mockResolvedValue(postUserMock);

    const response = await POST(createUserRequest());
    expect(response?.status).toBe(409);
  });

  it('should register if everything is alright', async () => {
    (userService.findUserByEmail as Mock).mockResolvedValue(null);

    if (!('api' in auth)) {
      auth.api = {};
    }
    (auth.api.signUpEmail as unknown as Mock) = vi.fn().mockResolvedValue(postUserMock);
    
    const response = await POST(createUserRequest());
    expect(response?.status).toBe(201);
    
    const data = await response?.json();
    expect(data.user).toBeTruthy();
  });
})