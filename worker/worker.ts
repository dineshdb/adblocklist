/**
 * Serves the Nepali News Clean filter list, rendered at the edge from the
 * repo's source lists (lists/*.txt on main). The repo stays the single source
 * of truth — no build step, no copy of the list lives here.
 *
 *   GET /nepali-news-filters.txt   the ABP 2.0 list (same output as scripts/build.ts)
 *   GET /hosts                    0.0.0.0-hosts variant of the same domains
 *   GET /                          tiny info page
 */

const RAW = "https://raw.githubusercontent.com/dineshdb/adblocklist/main/lists";

const preamble = (generated: string) => `
[Adblock Plus 2.0]
! Title: Nepali News Clean Filter
! Version: 0.1.0
! Expires: 1 days (update frequency)
! Homepage: https://dineshdb.github.io/adblocklist/
! License: https://dineshdb.github.io/adblocklist/LICENSE
!
! Please feel free to open an issue or contribute
! Repo: https://github.com/dineshdb/adblocklist
! For more info on rules, see https://adblockplus.org/filter-cheatsheet
! Generated at the edge: ${generated}
`;

async function fetchList(name: string): Promise<string[]> {
  const res = await fetch(`${RAW}/${name}`, {
    cf: { cacheTtl: 3600, cacheEverything: true },
  });
  if (!res.ok) throw new Error(`upstream ${name}: ${res.status}`);
  return (await res.text())
    .split("\n")
    .filter((l) => l.trim() !== "");
}

function text(body: string, type: string, cache: string): Response {
  return new Response(body, {
    headers: {
      "content-type": type,
      "cache-control": cache,
      "access-control-allow-origin": "*",
    },
  });
}

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const generated = new Date().toISOString().slice(0, 10);

    try {
      if (url.pathname === "/nepali-news-filters.txt") {
        const [sites, globalRules] = await Promise.all([
          fetchList("nepali-news-sites.txt"),
          fetchList("global-filter.txt"),
        ]);
        const filters = sites.flatMap((site) => [
          `! ----- START ${site} -----`,
          `||${site}/*.gif`,
          `||.gif^$domain=${site},image`,
          `! ----- END ${site} -----`,
          "",
        ]);
        return text(
          [preamble(generated), globalRules.join("\n"), "", ...filters].join(
            "\n",
          ),
          "text/plain; charset=utf-8",
          "public, s-maxage=3600",
        );
      }

      if (url.pathname === "/hosts") {
        const sites = await fetchList("nepali-news-sites.txt");
        const body = [
          "# Nepali News Clean Filter — hosts variant",
          `# generated ${generated}`,
          "# https://github.com/dineshdb/adblocklist",
          "",
          ...sites.map((s) => `0.0.0.0 ${s}`),
        ].join("\n");
        return text(
          body,
          "text/plain; charset=utf-8",
          "public, s-maxage=3600",
        );
      }

      if (url.pathname === "/") {
        return text(
          `<!doctype html><meta charset=utf-8><title>Nepali News Clean Filter</title>
<body style="font-family:ui-monospace,monospace;max-width:60ch;margin:3rem auto;line-height:1.6">
<h1>Nepali News Clean Filter</h1>
<p>Filter list for Nepali news sites, rendered at the edge from
<a href=https://github.com/dineshdb/adblocklist>github.com/dineshdb/adblocklist</a>.</p>
<ul>
<li><a href=/nepali-news-filters.txt>/nepali-news-filters.txt</a> — Adblock Plus 2.0 list (subscribe URL)</li>
<li><a href=/hosts>/hosts</a> — 0.0.0.0 hosts variant</li>
</ul>`,
          "text/html; charset=utf-8",
          "public, s-maxage=3600",
        );
      }

      return new Response("not found", { status: 404 });
    } catch (err) {
      return new Response(`upstream error: ${String(err)}`, {
        status: 502,
        headers: { "content-type": "text/plain" },
      });
    }
  },
};
