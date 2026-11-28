import {
  loadPortraitBank,
  readStyleScreenshot,
  type CellMatch,
} from "./portraitMatch";

export type MatchRequest = { characters: CharacterSummary[]; files: File[] };
export type MatchEvent =
  | { type: "bank"; done: number; total: number }
  | { type: "shot"; index: number; height: number; cells: CellMatch[] };

// Matching takes seconds per screenshot, so it runs off the main thread.
self.onmessage = async ({ data }: MessageEvent<MatchRequest>) => {
  const post = (event: MatchEvent) => self.postMessage(event);
  const bank = await loadPortraitBank(data.characters, (done, total) =>
    post({ type: "bank", done, total }),
  );
  for (const [index, file] of data.files.entries()) {
    const bitmap = await createImageBitmap(file);
    post({
      type: "shot",
      index,
      height: bitmap.height,
      cells: await readStyleScreenshot(file, bank),
    });
    bitmap.close();
  }
};
