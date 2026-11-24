"use client";

import { useEffect, useRef, useState } from "react";

export function PhotoDrop({ enabled, currentUrl }: { enabled: boolean; currentUrl?: string | null }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  function show(file: File | undefined) {
    setPreview(file?.type.startsWith("image/") ? URL.createObjectURL(file) : null);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (!enabled || !inputRef.current || !file?.type.startsWith("image/")) return;
    const transfer = new DataTransfer();
    transfer.items.add(file);
    inputRef.current.files = transfer.files;
    show(file);
  }

  function clear() {
    if (inputRef.current) inputRef.current.value = "";
    setPreview(null);
  }

  const src = preview ?? currentUrl;
  return (
    <div>
      <span className="label">Photo</span>
      <label
        onDragOver={(e) => {
          e.preventDefault();
          if (enabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`flex aspect-square w-full flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-dashed p-2 text-center text-xs ${
          dragging ? "border-blue-900 bg-blue-50" : "border-slate-300 bg-slate-50"
        } ${enabled ? "cursor-pointer hover:border-blue-900" : "cursor-not-allowed"}`}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element -- local blob previews
          <img src={src} alt="Customer photo" className="h-full w-full rounded object-cover" />
        ) : (
          <span className="text-slate-500">
            {enabled ? "Drag a photo here or click to choose" : "Photo uploads are disabled until Cloudinary is configured"}
          </span>
        )}
        <input
          ref={inputRef}
          type="file"
          name="photo"
          accept="image/*"
          className="sr-only"
          disabled={!enabled}
          onChange={(e) => show(e.target.files?.[0])}
        />
      </label>
      {preview && (
        <button type="button" className="mt-1 text-xs text-slate-500 hover:text-red-600" onClick={clear}>
          Remove new photo
        </button>
      )}
    </div>
  );
}
