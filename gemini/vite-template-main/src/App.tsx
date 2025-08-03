import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-background via-background to-background">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-primary/10" />

      <main className="container relative z-10 flex max-w-4xl flex-col items-center justify-center gap-10 px-4 py-16 text-center md:py-24">
        <div className="flex items-center gap-2 rounded-full border border-border/50 bg-background/50 px-4 py-1.5 text-xs text-muted-foreground backdrop-blur-sm">
          <Sparkles size={12} />
          <span>Vite + Tailwind + shadcn/ui</span>
        </div>

        <div className="space-y-8">
          <h1 className="font-serif text-4xl font-light tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              Scout
            </span>
          </h1>
          <p className="mx-auto max-w-lg text-lg text-muted-foreground md:text-xl">
            Your website is on the way. Let Scout Cook.
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <a href="https://scout.new" target="_blank" rel="noopener noreferrer">
            <Button size="lg" className="group">
              <span>Get Started</span>
              <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
            </Button>
          </a>
          <a
            href="https://x.com/scoutdotnew"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="lg" className="backdrop-blur-sm">
              Learn More
            </Button>
          </a>
        </div>
      </main>
    </div>
  );
}
