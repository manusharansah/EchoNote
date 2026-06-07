import { useEffect, useState } from "react";
import { AlertCircle, Download } from "lucide-react";
import api from "../api/client";

interface Props {
  url: string;
  fileName?: string;
  className?: string;
}

/**
 * Fetches a protected PDF through the authed axios client and renders
 * it via a blob URL so the iframe gets the Authorization header.
 */
export default function AuthedPDFViewer({ url, fileName, className }: Props) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let revoked: string | null = null;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setBlobUrl(null);

    api
      .get(url, { responseType: "blob" })
      .then((res) => {
        if (cancelled) return;
        const blob = new Blob([res.data], { type: "application/pdf" });
        const objUrl = URL.createObjectURL(blob);
        revoked = objUrl;
        setBlobUrl(objUrl);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(
          err?.response?.status === 401
            ? "Not authorised to view this PDF."
            : "Could not load PDF preview."
        );
      })
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
      if (revoked) URL.revokeObjectURL(revoked);
    };
  }, [url]);

  if (loading) {
    return (
      <div
        className={`flex h-[80vh] w-full items-center justify-center rounded-xl border border-slate-200 bg-white ${className ?? ""}`}
      >
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <div className="spinner" />
          <span className="text-sm">Loading PDF…</span>
        </div>
      </div>
    );
  }

  if (error || !blobUrl) {
    return (
      <div
        className={`flex h-[80vh] w-full flex-col items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white text-center ${className ?? ""}`}
      >
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-red-50 text-red-600">
          <AlertCircle size={22} />
        </div>
        <p className="text-sm font-medium text-slate-700">
          {error ?? "PDF preview unavailable."}
        </p>
        <a
          href={blobUrl ?? "#"}
          download={fileName}
          className="btn-secondary !py-2 text-sm"
          onClick={(e) => !blobUrl && e.preventDefault()}
        >
          <Download size={14} /> Try downloading instead
        </a>
      </div>
    );
  }

  return (
    <iframe
      src={blobUrl}
      title={fileName ?? "PDF preview"}
      className={`h-[80vh] w-full rounded-xl border border-slate-200 bg-white shadow-soft ${className ?? ""}`}
    />
  );
}
