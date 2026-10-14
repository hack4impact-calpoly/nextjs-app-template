import { afterEach, describe, expect, it, vi } from "vitest";
import { getDrink, getDrinks } from "@/lib/drinks";
import mockDrinks from "@/data/mockDrinks";

function mockFetch(body: unknown, status = 200) {
  const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status }));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("getDrinks", () => {
  it("returns the drinks the API sends back", async () => {
    mockFetch(mockDrinks);

    const drinks = await getDrinks();

    expect(drinks).toEqual(mockDrinks);
  });

  it("throws an error with the status code when the API fails", async () => {
    mockFetch({ error: "Failed to fetch drinks" }, 500);

    await expect(getDrinks()).rejects.toThrow("Failed to fetch drinks: 500");
  });
});

describe("getDrink", () => {
  it("asks the API for the drink with the given id", async () => {
    const fetchMock = mockFetch(mockDrinks[0]);

    const drink = await getDrink("abc/123");

    expect(fetchMock).toHaveBeenCalledWith("/api/drinks/abc%2F123");
    expect(drink).toEqual(mockDrinks[0]);
  });

  it("returns null when the drink doesn't exist", async () => {
    mockFetch({ error: "Drink not found" }, 404);

    await expect(getDrink("missing")).resolves.toBeNull();
  });

  it("throws an error with the status code when the API fails", async () => {
    mockFetch({ error: "Failed to fetch drink" }, 500);

    await expect(getDrink("abc")).rejects.toThrow("Failed to fetch drink abc: 500");
  });
});
