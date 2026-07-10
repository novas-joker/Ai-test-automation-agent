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
    targetDomain?: string|undefined;
    globalInstruction?: string;
    githubUsername?: string;
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

    // Listen for GitHub disconnect event
    useEffect(() => {
        const handleGitHubDisconnect = () => {
            setToken('');
            setUserRepoList([]);
        };

        window.addEventListener('github-disconnected', handleGitHubDisconnect);
        return () => {
            window.removeEventListener('github-disconnected', handleGitHubDisconnect);
        };
    }, []);

    const getGitHubUserToken = async () => {
        const result = await axios.get('/api/github/token');
        console.log(result.data.token);
        setToken(result.data.token);
    }
    const onAddRepo = async () => {
        window.location.href = '/api/github';
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
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                    <p className="text-sm text-muted-foreground mt-1">Manage connected repositories and monitor automated test runs.</p>
                </div>
                <div className="flex items-center gap-2 border border-border px-3 py-1.5 rounded-full bg-muted/40 text-xs font-mono text-muted-foreground shadow-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                    <span>credits remaining:</span>
                    <span className="font-semibold text-foreground">{userDetail?.credits ?? 0}</span>
                </div>
            </div>

            <Card className="border border-border bg-card/45 backdrop-blur-sm p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 rounded-xl">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 border border-border rounded-lg flex items-center justify-center bg-background shadow-inner">
                        <Image src="/github.png" alt="github" width={26} height={26} />
                    </div>
                    <div>
                        <h3 className="text-base font-semibold">Integrate GitHub</h3>
                        <p className="text-sm text-muted-foreground mt-0.5">Select a repository to scan files and generate E2E test scripts.</p>
                    </div>
                </div>
                <div className="w-full sm:w-auto">
                    {!token ? (
                        <Button className="w-full sm:w-auto" onClick={onAddRepo}>Connect GitHub</Button>
                    ) : (
                        <RepoDialog setRefreshPage={(refresh: boolean) => GetUserAddedRepoList()} />
                    )}
                </div>
            </Card>

            {userRepoList.length === 0 ? (
                <EmptyWorkspace />
            ) : (
                <UserRepoList repoList={userRepoList} setReload={() => GetUserAddedRepoList()} />
            )}
        </div>
    )

}

export default WorkspaceBody