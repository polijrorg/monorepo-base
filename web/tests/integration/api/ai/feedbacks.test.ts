import { describe, it, vi, beforeEach, expect, Mock } from "vitest";
import * as aiService from "@/backend/services/ai";
import { setCurrentRole } from "../../mocks/auth";
import { createRequest } from "../../mocks/requests";

vi.mock("@/backend/services/ai", () => ({
  saveFeedback: vi.fn(),
  indexDocument: vi.fn(),
  toAiContext: (user: { id: string; role: string }) => ({ userId: user.id, role: user.role }),
}));

import { POST as postFeedback } from "@/backend/api/ai/feedbacks/route";
import { POST as postDocument } from "@/backend/api/ai/documents/route";

describe("POST /api/ai/feedbacks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setCurrentRole("USER");
    (aiService.saveFeedback as Mock).mockResolvedValue({ id: "f1", rating: "DOWN" });
  });

  it("recusa quem não está logado", async () => {
    setCurrentRole(null);
    const response = await postFeedback(createRequest({ messageId: "m1", rating: "UP" }, "ai/feedbacks"));
    expect(response.status).toBe(401);
  });

  it("valida a avaliação", async () => {
    const response = await postFeedback(createRequest({ messageId: "m1", rating: "MEIO" }, "ai/feedbacks"));
    expect(response.status).toBe(400);
  });

  it("salva no nome do usuário da sessão", async () => {
    const response = await postFeedback(createRequest({ messageId: "m1", rating: "DOWN", comment: "inventou o prazo" }, "ai/feedbacks"));
    expect(response.status).toBe(201);
    expect(aiService.saveFeedback).toHaveBeenCalledWith(
      "test-user-id",
      expect.objectContaining({ messageId: "m1", rating: "DOWN", feature: "assistente" })
    );
  });
});

describe("POST /api/ai/documents", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setCurrentRole("USER");
    (aiService.indexDocument as Mock).mockResolvedValue({ sourceId: "doc-1", chunks: 3 });
  });

  it("recusa documento vazio ou com campo extra", async () => {
    expect((await postDocument(createRequest({ sourceId: "d", sourceName: "d.txt", text: "" }, "ai/documents"))).status).toBe(400);
    expect(
      (await postDocument(createRequest({ sourceId: "d", sourceName: "d.txt", text: "x", ownerId: "outro" }, "ai/documents"))).status
    ).toBe(400);
  });

  it("indexa no escopo do usuário da sessão", async () => {
    const response = await postDocument(createRequest({ sourceId: "doc-1", sourceName: "manual.txt", text: "Texto" }, "ai/documents"));
    expect(response.status).toBe(201);
    expect(aiService.indexDocument).toHaveBeenCalledWith(
      { userId: "test-user-id", role: "USER" },
      { sourceId: "doc-1", sourceName: "manual.txt", text: "Texto" }
    );
  });
});
