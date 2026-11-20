// news-image-20261120: ships the pre-rendered front page to the output dir.
//
// The image itself is baked into this repo as entry.png (rendered from
// build/news.html with headless Chrome). This program only copies it, so
// every run writes exactly the same bytes. No network, no randomness.
// After copying it checks the PNG signature and the 1 MiB cap, so a
// corrupted bundled image fails loudly instead of reaching the judge.

import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const MAX_BYTES = 1048576;

const here = dirname(fileURLToPath(import.meta.url));
const source = join(here, "entry.png");
const outDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
const target = join(outDir, "entry.png");

if (!existsSync(source)) {
  console.error(`entry.png not found next to main.ts: ${source}`);
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });
copyFileSync(source, target);

const head = readFileSync(target).subarray(0, 8);
if (!head.equals(PNG_MAGIC)) {
  console.error("output is not a valid PNG (bad signature)");
  process.exit(1);
}
const size = statSync(target).size;
if (size > MAX_BYTES) {
  console.error(`output is ${size} bytes, over the 1 MiB cap`);
  process.exit(1);
}
console.log(`wrote ${target} (${size} bytes)`);
