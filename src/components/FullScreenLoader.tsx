import React from "react";
import { Loader2 } from "lucide-react";

type FullScreenLoaderProps = {
  label?: string;
};

export default function FullScreenLoader({ label = "Loading..." }: FullScreenLoaderProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex items-center gap-3 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span>{label}</span>
      </div>
    </div>
  );
}


