"use client";

import React, { useState, useEffect, useRef } from "react";

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
}

const ColorPicker = ({ value, onChange }: ColorPickerProps) => {
  const [localColor, setLocalColor] = useState(value || "#000000");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync local state if prop changes from outside (e.g. undo/reset)
  useEffect(() => {
    setLocalColor(value || "#000000");
  }, [value]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setLocalColor(newColor);
    
    // Debounce the parent update to prevent heavy re-renders while dragging
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      onChange(newColor);
    }, 50); // 50ms is enough to feel instant but light for React
  };

  return (
    <div className="flex items-center gap-3">
      <input
        type="color"
        value={localColor}
        onInput={handleInput as any} // onInput is better for continuous updates in some browsers
        onChange={handleInput} // fallback
        className="w-8 h-8 rounded-md border shadow-sm p-0 cursor-pointer hover:scale-110 transition-transform"
      />
      <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase">
        {localColor}
      </span>
    </div>
  );
};

export default React.memo(ColorPicker);
