export interface AudioSceneEntry {
  dur: number;
  src: string;
}

export interface AudioManifest {
  paperId: string;
  voice: string;
  rate: string;
  scenes: AudioSceneEntry[];
  grandma?: AudioSceneEntry[];
}

let cached: AudioManifest[] | null = null;

export async function loadAudio(paperId: string): Promise<AudioManifest | null> {
  try {
    if (!cached) {
      const res = await fetch(`${import.meta.env.BASE_URL}audio-manifest.json`);
      if (!res.ok) return null;
      cached = (await res.json()) as AudioManifest[];
    }
    return cached.find((item) => item.paperId === paperId) ?? null;
  } catch {
    return null;
  }
}
