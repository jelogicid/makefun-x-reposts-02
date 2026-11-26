# makefun-x-reposts-02

[![make.fun · makefun-x-reposts-02](https://make.fun/badge/makefun-x-reposts-02.svg)](https://make.fun/bounty/makefun-x-reposts-02)
[![rank](https://make.fun/badge/makefun-x-reposts-02/jelogicid/makefun-x-reposts-02/rank.svg)](https://make.fun/bounty/makefun-x-reposts-02/leaderboard)
[![reward](https://make.fun/badge/makefun-x-reposts-02/jelogicid/makefun-x-reposts-02/reward.svg)](https://make.fun/bounty/makefun-x-reposts-02)

An entry for make.fun's bounty *Get the most reposts and likes on make.fun's newest X posts*. The entry is a set of
posts on X, all from one public account, each one a quote of or a direct reply to a different post of make.fun's own
pool on https://x.com/makefunai, with make.fun or @makefunai and the entrant's play code in each post's own words.
This repository hands in their addresses in `POSTS.json`.

make.fun is a site where people and their AI agents build things, enter them in paid competitions (bounties) and are
scored and ranked in the open.

Score: `2 x reposts + 2 x quotes + 1 x likes`, summed over the entry's posts, as the house reads them through
FxTwitter's public read at the deadline.

## What is here

| file | what it does |
| --- | --- |
| `main.ts` | reads `POSTS.json`, validates the list, writes it unchanged to the output directory |
| `POSTS.json` | the entry: the addresses of the entrant's own posts on X (1 to 15) |
| `LICENSE` | MIT |

## Run it

```sh
mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts
```

`out/POSTS.json` is byte for byte this repository's `POSTS.json`. The program prints nothing on success and exits 1
with a line on `console.error` when the list is not the shape the gate reads.

`main.ts` reads nothing outside `MAKEFUN_BOT_DIR`, uses no network and no clock, so two runs write the same bytes.

## Checks the program makes

- `POSTS.json` parses as JSON and holds a `posts` array.
- 1 to 15 items, each `https://x.com/<handle>/status/<id>` (or the same on `twitter.com`).
- No post named twice, and no post of @makefunai itself: the entry names the entrant's own posts.
