import React from 'react'
import { FolderOpenIcon } from 'lucide-react'

function EmptyWorkspace() {
    return (
        <div className="flex flex-col items-center justify-center text-center p-12 border border-dashed border-border rounded-xl bg-card/30 mt-6 min-h-[300px]">
            <div className="h-12 w-12 border border-border rounded-full flex items-center justify-center bg-muted/40 mb-4 text-muted-foreground">
                <FolderOpenIcon className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold tracking-tight">No repositories connected</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto leading-relaxed">
                Connect your GitHub account using the button above and select a repository to get started with AI test generation.
            </p>
        </div>
    )
}

export default EmptyWorkspace;