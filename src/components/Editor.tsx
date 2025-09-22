"use client";
import React from "react";
import RichTextEditor from "./RichTextEditor";

interface EditorProps {
  value: string;
  onChange: (content: string) => void;
}

export default function Editor({ value, onChange }: EditorProps) {
  return (
    <RichTextEditor
      value={value}
      onChange={onChange}
      placeholder="Escribe la descripción de la propiedad..."
      className="min-h-[350px]"
    />
  );
} 