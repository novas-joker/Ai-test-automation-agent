import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';
import { GitHubStatus } from './GitHubStatus';

function WorkspaceHeader() {
    return (
        <header className="border-b border-border w-full bg-background/80 backdrop-blur-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
                    <Image src={'/logo.svg'} alt='logo' width={32} height={32} />
                    <span className="font-mono font-bold tracking-tight text-lg">novas.agent</span>
                </Link>

                <nav className="flex items-center gap-6 text-sm font-medium text-muted-foreground">
                    <Link href="/workspace" className="text-foreground font-semibold hover:text-foreground transition-colors font-mono">
                        ~/workspace
                    </Link>
                    <Link href="/#features" className="hover:text-foreground transition-colors">
                        Features
                    </Link>
                    <Link href="/#pricing" className="hover:text-foreground transition-colors">
                        Pricing
                    </Link>
                </nav>

                <div className="flex items-center gap-4">
                    <GitHubStatus />
                    <UserButton afterSignOutUrl="/" />
                </div>
            </div>
        </header>
    );
}

export default WorkspaceHeader;
