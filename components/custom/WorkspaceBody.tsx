"use client"
import { UserDetailsContext } from '@/context/UserDetailsContext'
import React, { useContext, useEffect, useState } from 'react'
import Image from 'next/image';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import EmptyWorkspace from './EmptyWorkspace';
import axios from 'axios';
import { useRouter } from 'next/navigation';
1
function WorkspaceBody() {
    // const cookieStore = await cookies();
    // const token = cookieStore.get('gh_token')?.value
    const { userDetail } = useContext(UserDetailsContext);
    const router = useRouter();
    const [token, setToken] = useState('');
    useEffect(() => {
        getGitHubUserToken();
    }, []);

    const getGitHubUserToken = async () => {
        const result = await axios.get('/api/github/token');
        console.log(result.data.token);
        setToken(result.data.token);
    }
    const onAddRepo = async () => {
        router.push('/api/github');
    }

    return (
        <div>
            <div className="flex justify-between items-center">
                <h2 className='text-4xl font-medium'>WorkspaceBody</h2>
                <h2 className='text-blue-600 bg-blue-100 px-2 rounded-lg'>Remaining Credits: {userDetail?.credits}</h2>
            </div>
            <Card className={'mt-5 flex justify-between items-center p-4 border rounded-lg'}>
                <div className={'flex items-center gap-5'}>
                    <Image src={"/github.png"} alt="github" width={40} height={40} />
                    <h2 className="text-lg">Connect Github and Add Repository</h2>
                </div>
                <div>
                    {!token ? <Button onClick={onAddRepo}>Setup</Button> : <Button>+Add Repo</Button>}
                </div>
            </Card>
            <Card>
                <CardContent>
                    <EmptyWorkspace />
                </CardContent>
            </Card>

        </div>
    )
}

export default WorkspaceBody