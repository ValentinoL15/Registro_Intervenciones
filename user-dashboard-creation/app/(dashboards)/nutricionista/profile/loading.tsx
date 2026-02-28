import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <Loader2 className="h-10 w-10 animate-spin text-green-600" />
    </div>
  );
}