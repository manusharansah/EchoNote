import { useMemo } from "react";

interface VersionData {
  version_number: number;
  markdown: string;
  created_at: string;
}

interface Props {
  v1: VersionData;
  v2: VersionData;
}

type LineType = "same" | "removed" | "added";

interface DiffLine {
  type: LineType;
  text: string;
  num?: number;
}

function buildLCS(a: string[], b: string[]): string[] {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;
      else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  const lcs: string[] = [];
  let i = m;
  let j = n;
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      lcs.unshift(a[i - 1]);
      i--;
      j--;
    } else if (dp[i - 1][j] > dp[i][j - 1]) i--;
    else j--;
  }
  return lcs;
}

function computeDiff(oldText: string, newText: string) {
  const a = oldText.split("\n");
  const b = newText.split("\n");
  const lcs = buildLCS(a, b);
  const left: DiffLine[] = [];
  const right: DiffLine[] = [];
  let ai = 0;
  let bi = 0;
  let li = 0;
  let lNum = 1;
  let rNum = 1;
  while (ai < a.length || bi < b.length) {
    if (li < lcs.length && a[ai] === lcs[li] && b[bi] === lcs[li]) {
      left.push({ type: "same", text: a[ai], num: lNum++ });
      right.push({ type: "same", text: b[bi], num: rNum++ });
      ai++;
      bi++;
      li++;
    } else if (li < lcs.length && a[ai] !== lcs[li]) {
      left.push({ type: "removed", text: a[ai], num: lNum++ });
      right.push({ type: "same", text: "", num: undefined });
      ai++;
    } else if (li < lcs.length && b[bi] !== lcs[li]) {
      left.push({ type: "same", text: "", num: undefined });
      right.push({ type: "added", text: b[bi], num: rNum++ });
      bi++;
    } else {
      if (ai < a.length) {
        left.push({ type: "removed", text: a[ai], num: lNum++ });
        ai++;
      } else {
        left.push({ type: "same", text: "", num: undefined });
      }
      if (bi < b.length) {
        right.push({ type: "added", text: b[bi], num: rNum++ });
        bi++;
      } else {
        right.push({ type: "same", text: "", num: undefined });
      }
    }
  }
  return { left, right };
}

function LineRow({ line, side }: { line: DiffLine; side: "left" | "right" }) {
  const palette =
    line.type === "removed"
      ? "bg-red-50 text-red-900 border-l-2 border-red-400"
      : line.type === "added"
        ? "bg-emerald-50 text-emerald-900 border-l-2 border-emerald-400"
        : "bg-white text-slate-700 border-l-2 border-transparent";

  const prefix =
    line.type === "removed" ? "-" : line.type === "added" ? "+" : " ";

  return (
    <div className={`flex font-mono text-[12.5px] leading-5 ${palette}`}>
      <div className="w-10 flex-shrink-0 select-none px-2 text-right text-slate-400">
        {line.num ?? ""}
      </div>
      <div className="w-5 flex-shrink-0 select-none text-center text-slate-400">
        {prefix}
      </div>
      <pre className="flex-1 whitespace-pre-wrap break-words px-2">
        {line.text || " "}
      </pre>
    </div>
  );
}

export default function DiffViewer({ v1, v2 }: Props) {
  const { left, right } = useMemo(
    () => computeDiff(v1.markdown, v2.markdown),
    [v1.markdown, v2.markdown]
  );

  const stats = useMemo(() => {
    let added = 0;
    let removed = 0;
    right.forEach((l) => l.type === "added" && added++);
    left.forEach((l) => l.type === "removed" && removed++);
    return { added, removed };
  }, [left, right]);

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/60 px-5 py-3">
        <div className="flex items-center gap-4 text-sm text-slate-600">
          <span>
            Comparing{" "}
            <span className="font-semibold text-slate-900">v{v1.version_number}</span> →{" "}
            <span className="font-semibold text-slate-900">v{v2.version_number}</span>
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-medium text-emerald-700">
            +{stats.added} added
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2 py-0.5 font-medium text-red-700">
            −{stats.removed} removed
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2">
        <div className="border-r border-slate-200">
          <div className="border-b border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            v{v1.version_number} · {new Date(v1.created_at).toLocaleDateString()}
          </div>
          <div className="max-h-[70vh] overflow-y-auto">
            {left.map((line, i) => (
              <LineRow key={`l-${i}`} line={line} side="left" />
            ))}
          </div>
        </div>
        <div>
          <div className="border-b border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            v{v2.version_number} · {new Date(v2.created_at).toLocaleDateString()}
          </div>
          <div className="max-h-[70vh] overflow-y-auto">
            {right.map((line, i) => (
              <LineRow key={`r-${i}`} line={line} side="right" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
