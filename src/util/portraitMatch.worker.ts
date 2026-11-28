import {
  loadPortraitBank,
  readStyleScreenshot,
  type CellMatch,
} from "./portraitMatch";

export type MatchRequest = { characters: CharacterSummary[]; files: File[] };
export type MatchEvent =
  | { type: "bank"; done: number; total: number }
  | { type: "cell"; index: number; done: number; total: number }
  | { type: "shot"; index: number; height: number; cells: CellMatch[] }
  | { type: "error" };

const post = (event: MatchEvent) => self.postMessage(event);

async function match({ characters, files }: MatchRequest) {
  const bank = await loadPortraitBank(characters, (done, total) =>
    post({ type: "bank", done, total }),
  );
  for (const [index, file] of files.entries()) {
    const bitmap = await createImageBitmap(file);
    post({
      type: "shot",
      index,
      height: bitmap.height,
      cells: await readStyleScreenshot(file, bank, (done, total) =>
        post({ type: "cell", index, done, total }),
      ),
    });
    bitmap.close();
  }
}

// Matching takes seconds per screenshot, so it runs off the main thread.
// A rejected promise here never reaches the page's worker.onerror, so it is reported as a message.
self.onmessage = ({ data }: MessageEvent<MatchRequest>) =>
  match(data).catch(() => post({ type: "error" }));
