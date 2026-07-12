'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
      <style jsx>{`
        .nav-link {
          position: relative;
          padding: 0.5rem 0.75rem;
          border-radius: 0.375rem;
          transition: all 0.3s ease;
          color: hsl(var(--muted-foreground));
        }

        .nav-link:hover {
          background-color: hsl(var(--primary) / 0.1);
          color: hsl(var(--foreground));
        }

        .nav-link:active {
          background-color: hsl(var(--primary) / 0.15);
        }
      `}</style>

      {/* Header */}
      <header className="border-b border-border w-full bg-background/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo.svg" alt="Logo" width={32} height={32} />
            <span className="font-mono font-bold tracking-tight text-lg">novas.agent</span>
          </div>

          <nav className="hidden md:flex items-center gap-2 text-sm font-medium">
            <a href="#features" className="nav-link">
              Features
            </a>
            <a href="#architecture" className="nav-link">
              Architecture
            </a>
            <SignedOut>
              <Link href="/sign-in" className="nav-link">
                GitHub
              </Link>
            </SignedOut>
            <SignedIn>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="nav-link"
              >
                GitHub
              </a>
            </SignedIn>
          </nav>

          <div className="flex items-center gap-4">
            <SignedOut>
              <Button asChild variant="ghost" size="sm">
                <Link href="/sign-in">Sign In</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/sign-up">Get Started</Link>
              </Button>
            </SignedOut>
            <SignedIn>
              <Button asChild variant="outline" size="sm" className="font-mono">
                <Link href="/workspace">~/workspace</Link>
              </Button>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="grow flex flex-col items-center justify-center max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-muted/50 text-xs text-muted-foreground mb-8 font-mono">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          AI-Powered Playwright Automation
        </div>

        <h1 className="text-4xl sm:text-6xl font-sans font-extrabold tracking-tight mb-6 max-w-3xl leading-none">
          Automate E2E Testing with <span className="text-primary">AI Agents</span>
        </h1>

        <p className="text-lg text-muted-foreground max-w-2xl mb-10 leading-relaxed">
          Connect your GitHub repository. Let our AI analyze your codebase, generate clean test cases, and execute E2E test runs instantly using Browserbase.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-20 justify-center">
          <SignedOut>
            <Button asChild size="lg" className="px-8 font-semibold">
              <Link href="/sign-up">Start Testing Free</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="px-8 font-semibold">
              <Link href="/sign-in">Sign In</Link>
            </Button>
          </SignedOut>
          <SignedIn>
            <Button asChild size="lg" className="px-8 font-semibold font-mono">
              <Link href="/workspace">$ cd ~/workspace</Link>
            </Button>
          </SignedIn>
        </div>

        {/* Features Section */}
        <section id="features" className="w-full pt-10 border-t border-border scroll-mt-16">
          <div className="text-left mb-12">
            <h2 className="text-2xl font-bold tracking-tight font-mono text-muted-foreground mb-2">&gt; app.features</h2>
            <p className="text-sm text-muted-foreground">Minimal tooling, maximum reliability. Designed for developer velocity.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="border border-border rounded-lg p-6 bg-card/40 backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:bg-card/60 hover:shadow-lg hover:shadow-primary/10 cursor-pointer">
              <div className="font-mono text-xs text-primary mb-3">// REPO SCANNER</div>
              <h3 className="text-lg font-bold mb-2">GitHub Analysis</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Connect your codebase. The agent reads Next.js structure, pages, and components to detect user flows and routes dynamically.
              </p>
            </div>

            <div className="border border-border rounded-lg p-6 bg-card/40 backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:bg-card/60 hover:shadow-lg hover:shadow-primary/10 cursor-pointer">
              <div className="font-mono text-xs text-primary mb-3">// AGENT GENERATOR</div>
              <h3 className="text-lg font-bold mb-2">AI Test Cases</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Powered by Gemini models to draft precise E2E scenarios, priority levels, route maps, and expected test outcomes.
              </p>
            </div>

            <div className="border border-border rounded-lg p-6 bg-card/40 backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:bg-card/60 hover:shadow-lg hover:shadow-primary/10 cursor-pointer">
              <div className="font-mono text-xs text-primary mb-3">// CLOUD EXECUTION</div>
              <h3 className="text-lg font-bold mb-2">Browserbase Scripting</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Generates robust Playwright scripts and runs them on Browserbase, gathering live sessions, logs, and screenshots.
              </p>
            </div>
          </div>
        </section>

        {/* Code/Architecture Demo Box */}
        <section
          id="architecture"
          className="w-full mt-24 border border-border rounded-lg overflow-hidden bg-zinc-950/80 text-left font-mono text-xs shadow-2xl transition-all duration-300 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/20 scroll-mt-16"
        >
          <div className="bg-zinc-900 border-b border-border px-4 py-2 flex items-center justify-between text-muted-foreground">
            <div className="flex gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500"></span>
              <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
            </div>
            <span>agent_execution_flow.ts</span>
            <div></div>
          </div>
          <div className="p-6 overflow-x-auto text-zinc-300 space-y-2">
            <p className="text-zinc-500">// 1. Retrieve session and connect database</p>
            <p><span className="text-blue-400">const</span> user = <span className="text-purple-400">await</span> currentUser();</p>
            <p><span className="text-purple-400">await</span> db.insert(users).values(&#123; id: user.id, email: user.email &#125;);</p>
            <p className="text-zinc-500 mt-4">// 2. Scan repository tree and trigger AI analysis</p>
            <p><span className="text-blue-400">const</span> files = <span className="text-purple-400">await</span> getRepoTree(owner, repo);</p>
            <p><span className="text-blue-400">const</span> testCases = <span className="text-purple-400">await</span> ai.generateTestCases(files);</p>
            <p className="text-zinc-500 mt-4">// 3. Run E2E test scripts via cloud browser</p>
            <p><span className="text-blue-400">const</span> session = <span className="text-purple-400">await</span> browserbase.createSession();</p>
            <p><span className="text-emerald-400">console.log</span>(<span className="text-amber-300">`Running E2E tests: $&#123;session.url&#125;`</span>);</p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border w-full py-6 bg-background/50 text-center text-xs text-muted-foreground relative z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} novas.agent. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

      {/* Header */}
      <header className="border-b border-border w-full bg-background/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo.svg" alt="Logo" width={32} height={32} />
            <span className="font-mono font-bold tracking-tight text-lg">novas.agent</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="nav-link">
              Features
            </a>
            <a href="#architecture" className="nav-link">
              Architecture
            </a>
            <SignedOut>
              <Link href="/sign-in" className="nav-link">
                GitHub
              </Link>
            </SignedOut>
            <SignedIn>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="nav-link"
              >
                GitHub
              </a>
            </SignedIn>
          </nav>

          <div className="flex items-center gap-4">
            <SignedOut>
              <Button asChild variant="ghost" size="sm">
                <Link href="/sign-in">Sign In</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/sign-up">Get Started</Link>
              </Button>
            </SignedOut>
            <SignedIn>
              <Button asChild variant="outline" size="sm" className="font-mono">
                <Link href="/workspace">~/workspace</Link>
              </Button>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="grow flex flex-col items-center justify-center max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-muted/50 text-xs text-muted-foreground mb-8 font-mono animate-fade-in-down">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          AI-Powered Playwright Automation
        </div>

        <h1 className="text-4xl sm:text-6xl font-sans font-extrabold tracking-tight mb-6 max-w-3xl leading-none animate-fade-in">
          Automate E2E Testing with <span className="text-primary">AI Agents</span>
        </h1>

        <p className="text-lg text-muted-foreground max-w-2xl mb-10 leading-relaxed animate-fade-in-up">
          Connect your GitHub repository. Let our AI analyze your codebase, generate clean test cases, and execute E2E test runs instantly using Browserbase.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-20 justify-center">
          <SignedOut>
            <Button asChild size="lg" className="px-8 font-semibold">
              <Link href="/sign-up">Start Testing Free</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="px-8 font-semibold">
              <Link href="/sign-in">Sign In</Link>
            </Button>
          </SignedOut>
          <SignedIn>
            <Button asChild size="lg" className="px-8 font-semibold font-mono">
              <Link href="/workspace">$ cd ~/workspace</Link>
            </Button>
          </SignedIn>
        </div>

        {/* Features Section */}
        <section id="features" className="w-full pt-10 border-t border-border scroll-mt-16">
          <div className="text-left mb-12">
            <h2 className="text-2xl font-bold tracking-tight font-mono text-muted-foreground mb-2">&gt; app.features</h2>
            <p className="text-sm text-muted-foreground">Minimal tooling, maximum reliability. Designed for developer velocity.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="border border-border rounded-lg p-6 bg-card/40 backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:bg-card/60 hover:shadow-lg hover:shadow-primary/10 cursor-pointer">
              <div className="font-mono text-xs text-primary mb-3">// REPO SCANNER</div>
              <h3 className="text-lg font-bold mb-2">GitHub Analysis</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Connect your codebase. The agent reads Next.js structure, pages, and components to detect user flows and routes dynamically.
              </p>
            </div>

            <div className="border border-border rounded-lg p-6 bg-card/40 backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:bg-card/60 hover:shadow-lg hover:shadow-primary/10 cursor-pointer">
              <div className="font-mono text-xs text-primary mb-3">// AGENT GENERATOR</div>
              <h3 className="text-lg font-bold mb-2">AI Test Cases</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Powered by Gemini models to draft precise E2E scenarios, priority levels, route maps, and expected test outcomes.
              </p>
            </div>

            <div className="border border-border rounded-lg p-6 bg-card/40 backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:bg-card/60 hover:shadow-lg hover:shadow-primary/10 cursor-pointer">
              <div className="font-mono text-xs text-primary mb-3">// CLOUD EXECUTION</div>
              <h3 className="text-lg font-bold mb-2">Browserbase Scripting</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Generates robust Playwright scripts and runs them on Browserbase, gathering live sessions, logs, and screenshots.
              </p>
            </div>
          </div>
        </section>

        {/* Code/Architecture Demo Box */}
        <section
          id="architecture"
          className="w-full mt-24 border border-border rounded-lg overflow-hidden bg-zinc-950/80 text-left font-mono text-xs shadow-2xl transition-all duration-300 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/20 scroll-mt-16"
        >
          <div className="bg-zinc-900 border-b border-border px-4 py-2 flex items-center justify-between text-muted-foreground">
            <div className="flex gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500"></span>
              <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
            </div>
            <span>agent_execution_flow.ts</span>
            <div></div>
          </div>
          <div className="p-6 overflow-x-auto text-zinc-300 space-y-2">
            <p className="text-zinc-500">// 1. Retrieve session and connect database</p>
            <p><span className="text-blue-400">const</span> user = <span className="text-purple-400">await</span> currentUser();</p>
            <p><span className="text-purple-400">await</span> db.insert(users).values(&#123; id: user.id, email: user.email &#125;);</p>
            <p className="text-zinc-500 mt-4">// 2. Scan repository tree and trigger AI analysis</p>
            <p><span className="text-blue-400">const</span> files = <span className="text-purple-400">await</span> getRepoTree(owner, repo);</p>
            <p><span className="text-blue-400">const</span> testCases = <span className="text-purple-400">await</span> ai.generateTestCases(files);</p>
            <p className="text-zinc-500 mt-4">// 3. Run E2E test scripts via cloud browser</p>
            <p><span className="text-blue-400">const</span> session = <span className="text-purple-400">await</span> browserbase.createSession();</p>
            <p><span className="text-emerald-400">console.log</span>(<span className="text-amber-300">`Running E2E tests: $&#123;session.url&#125;`</span>);</p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border w-full py-6 bg-background/50 text-center text-xs text-muted-foreground relative z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© &#123;new Date().getFullYear()&#125; novas.agent. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Contact</a>
          </div>
        </div>
      </footer>
 

