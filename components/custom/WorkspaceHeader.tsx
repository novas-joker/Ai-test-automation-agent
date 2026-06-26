import React from 'react';
import Image from 'next/image';
import { UserButton } from '@clerk/nextjs';

function WorkspaceHeader() {
    return (
        <div className="flex w-full justify-between p-4" >
            {/*logo*/}
            <Image src={'/logo.svg'} alt='logo' width={50} height={50} />
            {/*menu options*/}
            <ul className='flex gap-5 text-xl'>
                <li className='hover:text-blue-600 cursor-pointer'>Workspace</li>
                <li className='hover:text-blue-600 cursor-pointer'>Pricing</li>
                <li className='hover:text-blue-600 cursor-pointer'>Support</li>
            </ul>
            {/*userButton*/}
            <UserButton />

        </div>
    )
}

export default WorkspaceHeader;