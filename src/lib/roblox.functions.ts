import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type GameStat = {
  placeId: number;
  universeId: number;
  name: string;
  playing: number;
  visits: number;
  favorites: number;
  thumbnail: string | null;
  url: string;
};

const universeCache = new Map<number, number>();

async function toUniverse(placeId: number): Promise<number | null> {
  if (universeCache.has(placeId)) return universeCache.get(placeId)!;
  const r = await fetch(`https://apis.roblox.com/universes/v1/places/${placeId}/universe`);
  if (!r.ok) return null;
  const j = (await r.json()) as { universeId?: number };
  if (!j.universeId) return null;
  universeCache.set(placeId, j.universeId);
  return j.universeId;
}

// Server-side proxy for Roblox APIs (avoids browser CORS limits)
export const getGameStats = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ placeIds: z.array(z.number()).max(50) }).parse(d))
  .handler(async ({ data }): Promise<{ games: GameStat[]; error?: string }> => {
    try {
      const pairs = await Promise.all(
        data.placeIds.map(async (p) => ({ placeId: p, universeId: await toUniverse(p) })),
      );
      const valid = pairs.filter((p): p is { placeId: number; universeId: number } => !!p.universeId);
      if (!valid.length) return { games: [] };
      const ids = valid.map((v) => v.universeId).join(",");
      const [gamesRes, thumbsRes] = await Promise.all([
        fetch(`https://games.roblox.com/v1/games?universeIds=${ids}`),
        fetch(
          `https://thumbnails.roblox.com/v1/games/multiget/thumbnails?universeIds=${ids}&countPerUniverse=1&size=768x432&format=Png&isCircular=false`,
        ),
      ]);
      const games = ((await gamesRes.json()) as { data?: any[] }).data ?? [];
      const thumbs = ((await thumbsRes.json()) as { data?: any[] }).data ?? [];
      return {
        games: valid.map(({ placeId, universeId }) => {
          const g = games.find((x) => x.id === universeId) ?? {};
          const t = thumbs.find((x) => x.universeId === universeId);
          return {
            placeId,
            universeId,
            name: g.name ?? "Unknown game",
            playing: g.playing ?? 0,
            visits: g.visits ?? 0,
            favorites: g.favoritedCount ?? 0,
            thumbnail: t?.thumbnails?.[0]?.imageUrl ?? null,
            url: `https://www.roblox.com/games/${placeId}`,
          };
        }),
      };
    } catch (e) {
      console.error("Roblox proxy failed", e);
      return { games: [], error: "Live stats unavailable" };
    }
  });
