"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { X, Plus } from "lucide-react";

interface Props {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  className?: string;
}

export function TagEditor({
  tags,
  onChange,
  placeholder = "Add topic…",
  maxTags = 10,
  className = "",
}: Props) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const addTag = () => {
    const val = input.trim();
    if (!val || tags.includes(val) || tags.length >= maxTags) return;
    onChange([...tags, val]);
    setInput("");
    inputRef.current?.focus();
  };

  const removeTag = (tag: string) => {
    onChange(tags.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    } else if (e.key === "Backspace" && input === "" && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  return (
    <div
      className={`flex flex-wrap gap-1.5 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2
                  focus-within:border-brand focus-within:ring-1 focus-within:ring-brand ${className}`}
      onClick={() => inputRef.current?.focus()}
      role="group"
      aria-label="Topic filter tags"
    >
      {tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 rounded bg-brand/20 px-2 py-0.5 text-xs
                     font-mono text-brand-light"
        >
          {tag}
          <button
            type="button"
            onClick={() => removeTag(tag)}
            aria-label={`Remove topic ${tag}`}
            className="hover:text-white transition"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}

      <div className="flex items-center gap-1 flex-1 min-w-[120px]">
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length >= maxTags ? `Max ${maxTags} topics` : placeholder}
          disabled={tags.length >= maxTags}
          className="flex-1 bg-transparent text-sm text-gray-100 placeholder-gray-500
                     outline-none disabled:cursor-not-allowed"
          aria-label="New topic input"
        />
        {input.trim() && (
          <button
            type="button"
            onClick={addTag}
            aria-label="Add topic"
            className="text-gray-400 hover:text-brand-light transition"
          >
            <Plus className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
