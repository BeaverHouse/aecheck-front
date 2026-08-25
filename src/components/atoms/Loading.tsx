import { Loader2 } from "lucide-react";

interface LoadingProps {
  message?: string;
}

function Loading({ message }: LoadingProps) {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex flex-col gap-4 items-center justify-center">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      {message && (
        <p className="text-sm text-muted-foreground text-center px-6 max-w-xs">
          {message}
        </p>
      )}
    </div>
  );
}

export default Loading;
