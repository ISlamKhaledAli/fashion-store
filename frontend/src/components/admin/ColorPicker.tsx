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
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
        onInput={
          handleInput as unknown as React.FormEventHandler<HTMLInputElement>
        } // onInput is better for continuous updates in some browsers
        onChange={handleInput} // fallback
        className="h-8 w-8 cursor-pointer rounded-md border p-0 shadow-sm transition-transform hover:scale-110"
      />
      <span className="font-mono text-[10px] font-bold text-zinc-400 uppercase">
        {localColor}
      </span>
    </div>
  );
};

export default React.memo(ColorPicker);
