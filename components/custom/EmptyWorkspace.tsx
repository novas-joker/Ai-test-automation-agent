import React from 'react'
import Image from 'next/image'
import { Button } from '../ui/button'
import { Link } from 'lucide-react'
function EmptyWorkspace() {
    return (
        <div className='flex flex-col mt-10 justify-center items-center'>
            <Image src={"/folder.png"} alt="folder" width={70} height={70} />
            <h2 className="font-medium text-2xl mt-5 mb-4">No repository connected</h2>
            <p className="text-center mx-10">Connect your GitHub account and add a repository to generate and run test cases.</p>
            <Button className={"mt-5"}><Link className="h-4 w-4 mr-2" />Connect repository</Button>
        </div>

    )
}

export default EmptyWorkspace