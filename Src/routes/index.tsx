import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { site } from "@/config/site";
import { getGameStats, type GameStat } from "@/lib/roblox.functions";

const statsQuery = queryOptions({
  queryKey: ["stats", site.placeIds],
  queryFn: () => getGameStats({ data: { placeIds: site.placeIds } }),
  refetchInterval: site.refreshSeconds * 1000,
});

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${site.name} | ${site.tagline}` },
      { name: "description", content: site.headline },
      { property: "og:title", content: site.name },
      { property: "og:description", content: site.headline },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(statsQuery),
  component: Index,
});

const fmt = (n: number) =>
  Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 2 }).format(n);

function HeroCollage({ games }: { games: GameStat[] }) {
  const tiles = Array.from({ length: 12 }, (_, i) => games[i % games.length]!).slice(0, 12);
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      <div className="grid h-full grid-cols-3 gap-3 p-3 md:grid-cols-4">
        {tiles.map((g, i) => (
          <div key={i} className="overflow-hidden rounded-2xl">
            {g.thumbnail && (
              <img src={g.thumbnail} alt="" className="h-full w-full object-cover" loading={i < 4 ? "eager" : "lazy"} />
            )}
          </div>
        ))}
      </div>
      <div className="absolute inset-0 bg-background/70" />
      <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_45%,transparent,var(--color-background)_95%)]" />
    </div>
  );
}

function GameCard({ g }: { g: GameStat }) {
  return (
    <a
      href={g.url}
      target="_blank"
      rel="noreferrer"
      className="group relative block aspect-[4/3] overflow-hidden rounded-2xl border border-border transition hover:-translate-y-1 hover:border-foreground/40"
    >
      {g.thumbnail && (
        <img
          src={g.thumbnail}
          alt={g.name}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/30" />
      <span className="absolute left-3 top-3 rounded-md bg-black/60 px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-white backdrop-blur">
        Featured
      </span>
      <div className="absolute inset-x-0 bottom-0 p-4">
        <h3 className="line-clamp-2 font-semibold text-white">{g.name}</h3>
        <div className="mt-1.5 flex gap-4 text-xs text-white/80">
          <span>{fmt(g.visits)} visits</span>
          <span className="flex items-center gap-1.5">
            <span className="live-dot" />
            {fmt(g.playing)} playing
          </span>
        </div>
      </div>
    </a>
  );
}

function Index() {
  const { data } = useQuery(statsQuery);
  const games = data?.games ?? [];
  const visits = games.reduce((a, g) => a + g.visits, 0);
  const playing = games.reduce((a, g) => a + g.playing, 0);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="absolute inset-x-0 top-0 z-20 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <span className="font-display text-lg tracking-tight">{site.shortName}</span>
        <div className="flex gap-8 text-xs font-semibold uppercase tracking-widest">
          <a href="#" className="border-b-2 border-foreground pb-1">Home</a>
          <a href="#games" className="pb-1 text-muted-foreground hover:text-foreground">Games</a>
        </div>
      </nav>

      {/* Hero */}
      <header className="relative flex min-h-screen flex-col items-center justify-center px-6 py-28 text-center">
        {games.length > 0 && <HeroCollage games={games} />}
        <div className="relative z-10">
          <h1 className="font-display text-6xl leading-none md:text-8xl">{site.name}</h1>
          <p className="mt-2 text-sm uppercase tracking-[0.35em] text-muted-foreground">{site.tagline}</p>
          <p className="mt-8 text-xl text-foreground/90 md:text-2xl">{site.headline}</p>

          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              [fmt(visits), "Total visits"],
              [fmt(playing), "Playing now"],
              [String(games.length), "Games live"],
            ].map(([v, l]) => (
              <div
                key={l}
                className="rounded-2xl border border-white/15 bg-white/10 px-6 py-5 backdrop-blur-md"
              >
                <div className="font-display text-2xl md:text-4xl">{v}</div>
                <div className="mt-1 text-[11px] uppercase tracking-wider text-white/70">{l}</div>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <a
              href="#games"
              className="rounded-full bg-foreground px-7 py-3 font-semibold text-background transition hover:opacity-90"
            >
              See our games →
            </a>
          </div>
        </div>
      </header>

      {/* Who we are */}
      <section className="mx-auto grid max-w-6xl gap-10 border-t border-border px-6 py-20 md:grid-cols-[1fr_2fr]">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Who we are</p>
          <h2 className="font-display mt-3 text-3xl">{site.name}</h2>
          <p className="text-muted-foreground">{site.tagline}</p>
        </div>
        <div className="space-y-5 text-lg text-muted-foreground">
          {site.about.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      </section>

      {/* Featured games */}
      <section id="games" className="border-t border-border px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-display text-center text-4xl md:text-5xl">Featured games</h2>
          <p className="mt-3 text-center text-muted-foreground">
            Titles we are actively growing. Live stats update every {site.refreshSeconds}s.
          </p>
          {data?.error && <p className="mt-4 text-center text-destructive">{data.error}</p>}
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {games.map((g) => (
              <GameCard key={g.placeId} g={g} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 md:flex-row">
          <span className="font-display">{site.name}</span>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground">Home</a>
            <a href="#games" className="hover:text-foreground">Games</a>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{fmt(visits)}+</span> visits ·
            <span className="font-semibold text-foreground">{fmt(playing)}</span> playing ·
            <span className="font-semibold text-foreground">{games.length}</span> games
          </div>
        </div>
        <p className="mt-8 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} {site.name}. Not affiliated with Roblox Corporation.
        </p>
      </footer>
    </div>
  );
}
