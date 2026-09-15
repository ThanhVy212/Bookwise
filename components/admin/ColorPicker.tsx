"use client";

import { useState } from "react";
import { HexColorInput, HexColorPicker } from "react-colorful";

interface Props {
  value?: string;
  onPickerChange: (color: string) => void;
}

const ColorPicker = ({ value = "#000000", onPickerChange }: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <div className="color-picker">
        <div
          className="size-5 cursor-pointer rounded border border-gray-200"
          style={{ backgroundColor: value || "#000000" }}
          onClick={() => setIsOpen(!isOpen)}
        />
        <p>#</p>
        <HexColorInput
          color={value}
          onChange={onPickerChange}
          className="hex-input"
        />
      </div>

      {isOpen && (
        <div className="relative z-50">
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <HexColorPicker
            color={value}
            onChange={onPickerChange}
            className="hex-color-picker"
          />
        </div>
      )}
    </div>
  );
};

export default ColorPicker;
