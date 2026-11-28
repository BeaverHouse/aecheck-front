import React from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { Camera, ImagePlus } from "lucide-react";
import useCheckStore from "../../../store/useCheckStore";
import { getNumber } from "../../../util/func";
import { AECharacterStyles } from "../../../constants/enum";
import { ASK_SCORE, type CellMatch } from "../../../util/portraitMatch";
import type {
  MatchEvent,
  MatchRequest,
} from "../../../util/portraitMatch.worker";
import CharacterAvatar from "../../atoms/character/Avatar";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { useAddInven } from "../../../hooks/useAddInven";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Shot {
  url: string;
  height: number;
  cells: CellMatch[];
}

interface Pick {
  shot: Shot;
  cell: CellMatch;
  options: CharacterSummary[]; // empty when the portrait matched nothing
  chosen: number; // index into options, -1 to leave the cell out
}

type ReaderProps = AnalysisProps & {
  onApply: (chars: CharacterSummary[]) => void;
};

const choiceClass =
  "rounded-[3px] has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring";
const labelHandlesClick = () => undefined; // the avatar sits in a label, whose input takes the click

/** One pick per owned portrait that could still change the checklist. */
function toPicks(
  allCharacters: CharacterSummary[],
  inven: number[],
  shots: Shot[],
): Pick[] {
  const byId = new Map(allCharacters.map((c) => [c.id, c]));
  // ★4 and ★5 share one picture, so a match on it offers both, the ★4 first: it is owned either way.
  const sameArt = (id: string) => {
    const char = byId.get(id)!;
    const four = allCharacters.find(
      (c) => c.code === char.code && c.style === AECharacterStyles.four,
    );
    return char.style === AECharacterStyles.normal && four
      ? [four, char]
      : [char];
  };
  const seen = new Set<string>();
  const picks: Pick[] = [];
  for (const shot of shots)
    for (const cell of shot.cells) {
      if (!cell.owned) continue;
      if (cell.status === "none") {
        picks.push({ shot, cell, options: [], chosen: -1 });
        continue;
      }
      if (seen.has(cell.id)) continue; // screenshots of one scrolling list overlap
      seen.add(cell.id);
      const ids =
        cell.status === "ok"
          ? [cell.id]
          : cell.candidates
              .filter((c) => c.score >= ASK_SCORE)
              .map((c) => c.id);
      const options = ids.flatMap(sameArt);
      if (options.every((c) => inven.includes(getNumber(c)))) continue;
      picks.push({
        shot,
        cell,
        options,
        chosen: cell.status === "ok" ? 0 : -1,
      });
    }
  return picks;
}

const CROP = 60; // a cell is 120 px of a screenshot scaled to 720 px high, shown here at half size

function Crop({ shot, cell }: Pick) {
  const scale = (CROP * 6) / shot.height;
  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-[3px]"
      style={{ width: CROP, height: CROP }}
    >
      <img
        src={shot.url}
        alt=""
        className="absolute max-w-none"
        style={{
          height: CROP * 6,
          left: CROP / 2 - cell.x * scale,
          top: CROP / 2 - cell.y * scale,
        }}
      />
    </div>
  );
}

/** Bar position 0-1: preparing the pictures fills the first half, reading the screenshots' cells the second. */
function progressOf(event: MatchEvent, shots: number, t: TFunction) {
  if (event.type === "bank")
    return {
      label: t("screenshot.loading", event),
      value: event.done / event.total / 2,
    };
  const cells = event.type === "cell" ? event.done / event.total : 1;
  return {
    label: t("screenshot.reading", { done: event.index + 1, total: shots }),
    value: 0.5 + (event.index + cells) / shots / 2,
  };
}

function ScreenshotReader({ allCharacters, onApply }: ReaderProps) {
  const { t } = useTranslation();
  const inven = useCheckStore((state) => state.inven);
  const [job, setJob] = React.useState<{ worker: Worker; urls: string[] }>();
  const [progress, setProgress] = React.useState({ label: "", value: 0 });
  const [picks, setPicks] = React.useState<Pick[]>();
  const progressId = React.useId();

  React.useEffect(
    () => () => {
      job?.worker.terminate();
      job?.urls.forEach(URL.revokeObjectURL);
    },
    [job],
  );

  const read = (files: File[]) => {
    const worker = new Worker(
      new URL("../../../util/portraitMatch.worker.ts", import.meta.url),
    );
    const urls = files.map((file) => URL.createObjectURL(file));
    const shots: Shot[] = [];
    worker.onerror = () =>
      setProgress((p) => ({ ...p, label: t("screenshot.error") }));
    worker.onmessage = ({ data }: MessageEvent<MatchEvent>) => {
      setProgress(progressOf(data, files.length, t));
      if (data.type !== "shot") return;
      shots.push({
        url: urls[data.index],
        height: data.height,
        cells: data.cells,
      });
      if (shots.length === files.length)
        setPicks(toPicks(allCharacters, inven, shots));
    };
    worker.postMessage({
      characters: allCharacters,
      files,
    } satisfies MatchRequest);
    setJob({ worker, urls });
  };

  if (!job)
    return (
      <label
        className={cn(
          buttonVariants(),
          "mx-auto cursor-pointer has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
        )}
      >
        <input
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={(e) => e.target.files?.length && read([...e.target.files])}
        />
        <ImagePlus />
        {t("screenshot.pick")}
      </label>
    );
  if (!picks)
    return (
      <div className="space-y-2">
        <p id={progressId} role="status" className="text-sm text-foreground">
          {progress.label}
        </p>
        <progress
          aria-labelledby={progressId}
          value={progress.value}
          className="h-2 w-full overflow-hidden rounded-full [&::-moz-progress-bar]:bg-primary [&::-webkit-progress-bar]:bg-muted [&::-webkit-progress-value]:bg-primary"
        />
        <p className="text-xs text-muted-foreground">{t("screenshot.wait")}</p>
      </div>
    );

  const choose = (pick: Pick, chosen: number) =>
    setPicks(picks.map((p) => (p === pick ? { ...p, chosen } : p)));
  const sure = picks.filter(
    (p) => p.options.length === 1 && p.cell.status === "ok",
  );
  const unknown = picks.filter((p) => p.options.length === 0);
  const unsure = picks.filter((p) => !sure.includes(p) && !unknown.includes(p));
  const chosen = picks.flatMap((p) => p.options[p.chosen] ?? []);

  return (
    <div className="space-y-4 text-foreground">
      {sure.length > 0 && (
        <section className="space-y-2">
          <h3 className="text-sm font-semibold">{t("screenshot.sure")}</h3>
          <div className="grid grid-cols-[repeat(auto-fill,75px)] gap-4 p-2">
            {sure.map((pick) => (
              <label
                key={pick.cell.id}
                className={cn(choiceClass, pick.chosen < 0 && "opacity-40")}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={pick.chosen === 0}
                  onChange={(e) => choose(pick, e.target.checked ? 0 : -1)}
                />
                <CharacterAvatar
                  info={pick.options[0]}
                  disableShadow
                  disableGray
                  disableTierRing
                  onClick={labelHandlesClick}
                />
              </label>
            ))}
          </div>
        </section>
      )}
      {unsure.length > 0 && (
        <section className="space-y-2">
          <h3 className="text-sm font-semibold">{t("screenshot.unsure")}</h3>
          <p className="text-xs text-muted-foreground">
            {t("screenshot.unsureDesc")}
          </p>
          {unsure.map((pick) => (
            <div key={pick.cell.id} className="flex items-center gap-3 p-2">
              <Crop {...pick} />
              <fieldset className="flex flex-wrap items-start gap-3">
                <legend className="sr-only">{t(pick.options[0].code)}</legend>
                {pick.options.map((option, i) => (
                  <label
                    key={option.id}
                    className={cn(
                      choiceClass,
                      pick.chosen !== i && "opacity-40",
                    )}
                  >
                    <input
                      type="radio"
                      name={pick.cell.id}
                      className="sr-only"
                      checked={pick.chosen === i}
                      onChange={() => choose(pick, i)}
                    />
                    <CharacterAvatar
                      info={option}
                      disableShadow
                      disableGray
                      disableTierRing
                      onClick={labelHandlesClick}
                    />
                    <span className="mt-1 block text-center text-xs">
                      {option.style === AECharacterStyles.four ? "★4" : "★5"}
                    </span>
                  </label>
                ))}
                <label
                  className={cn(
                    choiceClass,
                    "flex h-[75px] w-[75px] cursor-pointer items-center justify-center border border-border text-center text-xs",
                    pick.chosen >= 0 && "opacity-40",
                  )}
                >
                  <input
                    type="radio"
                    name={pick.cell.id}
                    className="sr-only"
                    checked={pick.chosen < 0}
                    onChange={() => choose(pick, -1)}
                  />
                  {t("screenshot.skip")}
                </label>
              </fieldset>
            </div>
          ))}
        </section>
      )}
      {unknown.length > 0 && (
        <section className="space-y-2">
          <h3 className="text-sm font-semibold">{t("screenshot.unknown")}</h3>
          <div className="flex flex-wrap gap-2 p-2">
            {unknown.map((pick, i) => (
              <Crop key={i} {...pick} />
            ))}
          </div>
        </section>
      )}
      <Button
        className="w-full"
        disabled={chosen.length === 0}
        onClick={() => onApply(chosen)}
      >
        {t("screenshot.apply", { n: chosen.length })}
      </Button>
    </div>
  );
}

function ScreenshotImport({ allCharacters }: AnalysisProps) {
  const { t } = useTranslation();
  const [open, setOpen] = React.useState(false);
  const addInven = useAddInven(allCharacters);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          aria-label={t("screenshot.title")}
          className="h-9 shrink-0 rounded-full px-3 text-foreground"
        >
          <Camera />
          {t("screenshot.button")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("screenshot.title")}</DialogTitle>
          <DialogDescription>{t("screenshot.description")}</DialogDescription>
        </DialogHeader>
        <ScreenshotReader
          allCharacters={allCharacters}
          onApply={(chars) => {
            addInven(chars);
            setOpen(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

export default ScreenshotImport;
