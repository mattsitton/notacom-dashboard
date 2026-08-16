"use client";
import Workspace from "@/components/Workspace";

const localFiles = [
  { id: "1", name: "Welcome.md", content: "# Welcome to your Workspace\n\nClick the + button to create a new file, or navigate to the GitHub tab to edit cloud files.", language: "markdown" }
];

export default function CodeEditorPage() {
  return (
    <div className="max-w-7xl mx-auto h-[85vh]">
      <Workspace initialFiles={localFiles} />
    </div>
  );
}
