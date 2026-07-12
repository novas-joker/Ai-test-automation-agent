import WorkspaceBody from '@/components/custom/WorkspaceBody'
import React from 'react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Workspace',
  description: 'Manage your repositories, generate AI test cases, and run E2E tests from your workspace.',
}


function Workspace() {
    return (
        <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10'>
            <WorkspaceBody />
        </div>
    )
}

export default Workspace