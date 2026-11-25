import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { COURSES } from "../src/data/courses.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const AUDIO_DIR = join(ROOT, "public", "audio");
const VOICE = "zh-CN-XiaoxiaoNeural";
// -25% 经校准：63 字 ≈ 14.8 秒 ≈ 4.25 字/秒，与 15s/场景匹配
const RATE = "-25%";
const PAPER_IDS = ["1706.03762", "2106.09685", "2005.11401", "2201.11903"];

function render(text, out) {
  const result = spawnSync(
    "python",
    ["-m", "edge_tts", "--voice", VOICE, `--rate=${RATE}`, "--text", text, "--write-media", out],
    { encoding: "utf8", timeout: 60_000 },
  );
  if (result.status !== 0) {
    throw new Error(`edge-tts failed for ${out}: ${result.stderr}`);
  }
}

const manifest = [];

for (const paperId of PAPER_IDS) {
  const course = COURSES[paperId];
  if (!course) throw new Error(`missing course ${paperId}`);
  const entry = { paperId, voice: VOICE, rate: RATE, scenes: [] };
  const dir = join(AUDIO_DIR, paperId);
  mkdirSync(dir, { recursive: true });
  for (let i = 0; i < course.scenes.length; i += 1) {
    const scene = course.scenes[i];
    const src = `audio/${paperId}/scene-${i}.mp3`;
    const out = join(dir, `scene-${i}.mp3`);
    render(scene.narration, out);
    entry.scenes.push({ dur: scene.duration, src });
    console.log(`rendered ${src} (${scene.duration}ms)`);
  }
  if (course.grandma) {
    entry.grandma = [];
    for (let i = 0; i < course.grandma.scenes.length; i += 1) {
      const scene = course.grandma.scenes[i];
      const src = `audio/${paperId}/grandma-scene-${i}.mp3`;
      const out = join(dir, `grandma-scene-${i}.mp3`);
      render(scene.narration, out);
      entry.grandma.push({ dur: course.scenes[i].duration, src });
      console.log(`rendered ${src} (${course.scenes[i].duration}ms)`);
    }
  }
  manifest.push(entry);
}

writeFileSync(
  join(ROOT, "public", "audio-manifest.json"),
  JSON.stringify(manifest, null, 2) + "\n",
  "utf8",
);
const sceneCount = manifest.reduce(
  (n, m) => n + m.scenes.length + (m.grandma?.length ?? 0),
  0,
);
console.log(`manifest written: ${manifest.length} papers, ${sceneCount} audio files`);
