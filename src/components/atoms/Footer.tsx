"use client";

import { Github, Mail } from "lucide-react";

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
          <Github className="w-4 h-4" />
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
