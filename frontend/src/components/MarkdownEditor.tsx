import { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import {
  Bold,
  Italic,
  Heading2,
  Minus,
  Columns2,
  Pencil,
  Eye,
  Save,
  Check,
} from "lucide-react";

interface Props {
  initialValue: string;
  onSave: (markdown: string) => Promise<void>;
  saving: boolean;
}

type View = "split" | "edit" | "preview";

function WordCount({ text }: { text: string }) {
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const chars = text.length;
  return (
    <span className="text-xs text-slate-500">
      {words.toLocaleString()} words · {chars.toLocaleString()} chars
    </span>
  );
}

export default function MarkdownEditor({ initialValue, onSave, saving }: Props) {
  const [value, setValue] = useState(initialValue);
  const [view, setView] = useState<View>("split");
  const [saved, setSaved] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSave = async () => {
    await onSave(value);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const insertMarkdown = (prefix: string, suffix = "") => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = value.slice(start, end);
    const newVal = value.slice(0, start) + prefix + selected + suffix + value.slice(end);
    setValue(newVal);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

  const tools: { label: string; Icon: any; title: string; action: () => void }[] = [
    { label: "Bold",    Icon: Bold,     title: "Bold",    action: () => insertMarkdown("**", "**") },
    { label: "Italic",  Icon: Italic,   title: "Italic",  action: () => insertMarkdown("_", "_") },
    { label: "Heading", Icon: Heading2, title: "Heading", action: () => insertMarkdown("## ") },
    { label: "Divider", Icon: Minus,    title: "Divider", action: () => insertMarkdown("\n---\n") },
  ];

  const views: { key: View; Icon: any }[] = [
    { key: "edit",    Icon: Pencil },
    { key: "split",   Icon: Columns2 },
    { key: "preview", Icon: Eye },
  ];

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-3 py-2">
        <div className="flex items-center gap-0.5">
          {tools.map(({ label, Icon, title, action }) => (
            <button
              key={label}
              onClick={action}
              title={title}
              className="grid h-8 w-8 place-items-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            >
              <Icon size={14} />
            </button>
          ))}
          <span className="mx-1.5 h-5 w-px bg-slate-200" />
          <div className="inline-flex rounded-md border border-slate-200 bg-slate-50 p-0.5">
            {views.map(({ key, Icon }) => (
              <button
                key={key}
                onClick={() => setView(key)}
                title={key}
                className={`grid h-7 w-7 place-items-center rounded text-slate-500 transition ${
                  view === key ? "bg-white text-slate-900 shadow-soft" : "hover:text-slate-700"
                }`}
              >
                <Icon size={13} />
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <WordCount text={value} />
          <button onClick={handleSave} disabled={saving} className="btn-primary !py-1.5 text-xs">
            {saving ? (
              <>
                <div className="h-3.5 w-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                Saving…
              </>
            ) : saved ? (
              <>
                <Check size={13} strokeWidth={3} /> Saved
              </>
            ) : (
              <>
                <Save size={13} /> Save version
              </>
            )}
          </button>
        </div>
      </div>

      {/* Panels */}
      <div className="flex flex-1 overflow-hidden">
        {(view === "edit" || view === "split") && (
          <div className={`${view === "split" ? "w-1/2 border-r border-slate-200" : "w-full"} flex flex-col bg-white`}>
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="flex-1 resize-none border-0 bg-white px-5 py-4 font-mono text-[13.5px] leading-relaxed text-slate-800 outline-none placeholder:text-slate-400"
              placeholder="Edit your minutes in Markdown…"
              spellCheck={false}
            />
          </div>
        )}
        {(view === "preview" || view === "split") && (
          <div className={`${view === "split" ? "w-1/2" : "w-full"} overflow-y-auto bg-slate-50/60 px-6 py-5`}>
            <article className="prose-meeting">
              <ReactMarkdown>{value || "*Nothing to preview yet.*"}</ReactMarkdown>
            </article>
          </div>
        )}
      </div>
    </div>
  );
}
