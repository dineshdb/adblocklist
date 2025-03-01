#!/usr/bin/env deno run --allow-read --allow-write --allow-net

const preamble = `
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
`;

const contents = await Deno.readTextFile("lists/nepali-news-sites.txt");
const globalFilter = await Deno.readTextFile("lists/global-filter.txt");
const sites = contents.split("\n").filter((l: string) => l.trim() !== "");
const filters = sites.map((site: string) => `
! ----- START ${site} -----
||${site}/*.gif
||.gif^$domain=${site},image
! ----- END ${site} -----
`);

await Deno.mkdir("_site/filters", { recursive: true });
await Deno.writeTextFile(
  "_site/filters/nepali-news-filters.txt",
  [preamble, globalFilter, ...filters].join("\n"),
);
