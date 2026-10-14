import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/drinks/route";
import mockDrinks from "@/data/mockDrinks";

const { connectDB, find, sort } = vi.hoisted(() => ({
  connectDB: vi.fn(),
  find: vi.fn(),
  sort: vi.fn(),
}));

vi.mock("@/database/db", () => ({ default: connectDB }));
vi.mock("@/database/drinkSchema", () => ({ default: { find } }));

beforeEach(() => {
  vi.resetAllMocks();
  find.mockReturnValue({ sort });
});

describe("GET /api/drinks", () => {
  it("sorts drinks by _id so they come back in the same order every time", async () => {
    sort.mockReturnValue({ lean: vi.fn().mockResolvedValue(mockDrinks) });

    const res = await GET();

    expect(sort).toHaveBeenCalledWith({ _id: 1 });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(mockDrinks);
  });

  it("returns 500 when the database fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    connectDB.mockRejectedValue(new Error("connection refused"));

    const res = await GET();

    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "Failed to fetch drinks" });
  });
});
