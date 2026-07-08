"use client"
import { UserDetailsContext } from '@/context/UserDetailsContext'
import React, { useContext, useEffect, useState } from 'react'
import Image from 'next/image';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import EmptyWorkspace from './EmptyWorkspace';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import RepoDialog, { Repo } from './RepoDialog';
import UserRepoList from './UserRepoList';

export type UserRepo={
    id:number;
    repoId:number;
    name:string;
    fullName:string;
    private:string;
    htmlUrl:string;
    description:string;
    userId:number;
    owner:string;
    updatedAt?:string;
    language:string;
    defaultBranch:string;
    targetDomain?: string;
    globalInstruction?: string;
}

function WorkspaceBody() {
    // const cookieStore = await cookies();
    // const token = cookieStore.get('gh_token')?.value
    const { userDetail } = useContext(UserDetailsContext);
    const router = useRouter();
    const [token, setToken] = useState('');
    const [userRepoList, setUserRepoList] = useState<UserRepo[]>([]);
    useEffect(() => {
        getGitHubUserToken();
    }, []);
    useEffect(() => {
        if (userDetail?.id) {
            GetUserAddedRepoList();
        }
    }, [userDetail?.id])

    const getGitHubUserToken = async () => {
        const result = await axios.get('/api/github/token');
        console.log(result.data.token);
        setToken(result.data.token);
    }
    const onAddRepo = async () => {
        router.push('/api/github');
    }
    const GetUserAddedRepoList = async () => {
        try {
            const result = await axios.get<UserRepo[]>(`/api/userRepo?userId=${userDetail?.id}`);
            setUserRepoList(Array.isArray(result.data) ? result.data : []);
            console.log('Fetched repos:', result.data);
        }
        catch (e) {
            console.log("Axios error: ", e)
            setUserRepoList([]);
        }
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
                    {!token ? <Button onClick={onAddRepo}>Setup</Button> :
                        <RepoDialog setRefreshPage={(refresh: boolean) => GetUserAddedRepoList()} />}
                </div>
            </Card>
            {userRepoList.length === 0 ? 
            <Card className="mt-10">
                <CardContent> 
                    <EmptyWorkspace /> 
                </CardContent>
            </Card>: 
            <UserRepoList repoList={userRepoList} setReload={()=>GetUserAddedRepoList()} />}
        </div>
    )
}

export default WorkspaceBody