"use client";

import { Mail } from "lucide-react";

// Drawn here because lucide 1.0 dropped every brand icon over trademark
// concerns, and one mark does not justify a second icon package.
function GithubMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.21.09 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.34-5.47-5.96 0-1.32.47-2.39 1.24-3.23-.13-.3-.54-1.53.11-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6.01 0c2.29-1.55 3.3-1.23 3.3-1.23.65 1.65.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.23 0 4.63-2.8 5.65-5.48 5.95.43.37.82 1.1.82 2.22v3.29c0 .32.22.7.82.58A12.01 12.01 0 0 0 24 12.5C24 5.87 18.63.5 12 .5z" />
    </svg>
  );
}

function Footer() {
  return (
    <footer className="relative z-10 border-t border-border/50 bg-background/80 backdrop-blur-sm py-4 mt-auto">
      <div className="flex items-center justify-center gap-6 text-muted-foreground">
        <a
          href="https://github.com/BeaverHouse/aecheck-front"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 text-xs hover:text-foreground transition-colors"
        >
          <GithubMark className="w-4 h-4" />
          <span>GitHub</span>
        </a>
        <a
          href="mailto:haulrest@gmail.com"
          className="flex items-center gap-1.5 text-xs hover:text-foreground transition-colors"
        >
          <Mail className="w-4 h-4" />
          <span>Contact</span>
        </a>
      </div>
    </footer>
  );
}

export default Footer;
