// makefun-x-reposts-02 entry: hands in the addresses of the entry's own posts on X.
//
// The gate reads POSTS.json from /output after this program runs, and that file is the entry: a list of 1 to 15
// posts, all from one public X account, each one quoting or replying directly to a different post of make.fun's
// pool on x.com/makefunai. Nothing this program writes about the posts is scored, so the whole job here is to
// read the list, refuse it when it is not the shape the gate reads, and hand it over unchanged.
//
// No network, no clock, no file outside MAKEFUN_BOT_DIR: the same input always writes the same bytes.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const MIN_POSTS = 1;
const MAX_POSTS = 15;
const MAX_BYTES = 16384;
const POST_URL = /^https:\/\/(x|twitter)\.com\/([A-Za-z0-9_]{1,15})\/status\/(\d+)$/;
const POOL_OWNER = 'makefunai';

function fail(message: string): never {
  console.error(`main.ts: ${message}`);
  process.exit(1);
}

type Checked = { text: string; source: string };

function readPostsFile(): Checked {
  const path = join(BOT_DIR, 'POSTS.json');
  let source: string;
  try {
    source = readFileSync(path, 'utf8');
  } catch (err) {
    fail(`cannot read ${path}: ${(err as Error).message}`);
  }
  return { text: source, source: path };
}

function collectUrls(source: string): string[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(source);
  } catch (err) {
    fail(`POSTS.json is not valid JSON: ${(err as Error).message}`);
  }
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    fail('POSTS.json must be a JSON object holding a posts array');
  }
  const posts = (parsed as { posts?: unknown }).posts;
  if (!Array.isArray(posts)) {
    fail('POSTS.json has no posts array');
  }
  return posts.map((item, index) => {
    if (typeof item !== 'string') {
      fail(`posts[${index}] is not a string`);
    }
    return item;
  });
}

function validateUrls(urls: string[], bytes: number): void {
  if (bytes > MAX_BYTES) {
    fail(`POSTS.json is ${bytes} bytes, and the gate takes at most ${MAX_BYTES}`);
  }
  if (urls.length < MIN_POSTS) {
    fail(`posts holds ${urls.length} items, and the gate takes at least ${MIN_POSTS}`);
  }
  if (urls.length > MAX_POSTS) {
    fail(`posts holds ${urls.length} items, and the gate takes at most ${MAX_POSTS}`);
  }
  const seen = new Set<string>();
  let handle: string | null = null;
  urls.forEach((url, index) => {
    const match = POST_URL.exec(url);
    if (!match) {
      fail(`posts[${index}] is not an X post address: ${url}`);
    }
    const owner = match[2].toLowerCase();
    if (owner === POOL_OWNER) {
      fail(`posts[${index}] is a post of @${POOL_OWNER}, and the entry names the entrant's own posts`);
    }
    if (handle === null) {
      handle = owner;
    } else if (handle !== owner) {
      fail(`posts[${index}] is on @${owner}, and the entry's posts come from one account (@${handle})`);
    }
    const id = match[3];
    if (seen.has(id)) {
      fail(`posts[${index}] names the post ${id} a second time`);
    }
    seen.add(id);
  });
}

function writeOutput(source: string): void {
  try {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  } catch (err) {
    fail(`cannot make ${OUTPUT_DIR}: ${(err as Error).message}`);
  }
  const target = join(OUTPUT_DIR, 'POSTS.json');
  try {
    writeFileSync(target, source);
  } catch (err) {
    fail(`cannot write ${target}: ${(err as Error).message}`);
  }
}

function main(): void {
  const { text } = readPostsFile();
  const urls = collectUrls(text);
  validateUrls(urls, Buffer.byteLength(text, 'utf8'));
  writeOutput(text);
}

main();
