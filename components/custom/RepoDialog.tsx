import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from '../ui/button';
import axios from 'axios';
import { UserDetailsContext } from '@/context/UserDetailsContext';
type Repo = {
    id: number;
    name: string;
    full_name: string;
    private_: boolean;
    html_url: string;
    description: string;
    updated_at: string;
    language: string;
    default_branch: string;
    owner: string;
}

function RepoDialog({ setRefreshPage }: { setRefreshPage: (refresh: boolean) => void }) {
    const [repoList, setRepoList] = useState<Repo[]>([]);
    const [selectedRepo, setSelectedRepo] = useState<Repo | null>(null);
    const [search, setSearch] = useState('');
    const { userDetail } = useContext(UserDetailsContext);
    const [isOpen, setIsOpen] = useState(false);
    useEffect(() => {
        GetReposList();
    }, []);
    const GetReposList = async () => {
        const result = await axios.get('/api/github/repos');
        console.log(result.data);
        setRepoList(result.data)
    }
    const filteredRepoList = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return repoList;
        return repoList.filter(r => r.full_name.toLowerCase().includes(q))
    }, [repoList, search]);

    const saveRepoToDb = async () => {
        if (!selectedRepo) return;
        const result = await axios.post('/api/userRepo', {
            repoId: selectedRepo.id,
            name: selectedRepo.name,
            fullName: selectedRepo.full_name,
            private_: selectedRepo.private_,
            htmlUrl: selectedRepo.html_url,
            description: selectedRepo.description,
            updatedAt: selectedRepo.updated_at,
            language: selectedRepo.language,
            owner: selectedRepo.owner,
            userId: userDetail?.id,
            default_branch: selectedRepo.default_branch,
        })
        console.log(result.data);
        setIsOpen(false);
        setRefreshPage(true);
    }
    return (
        <Dialog open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
            <DialogTrigger asChild>
                <Button>+Add repo</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Repository</DialogTitle>
                    <DialogDescription>
                        Search and select one of your github Repository
                    </DialogDescription>
                </DialogHeader>
                <div>
                    <Input placeholder='Search Repos by Name' onChange={(e) => setSearch(e.target.value)} />
                    {/*Repo List*/}
                    <ul className='max-h-60 overflow-y-auto border rounded-2xl mt-4'>
                        {filteredRepoList.map((repo) => (
                            <li key={repo.id}
                                className={`p-4 border-b hover:bg-gray-600 cursor-pointer
                                ${selectedRepo?.id === repo.id ? 'bg-gray-600' : null}`}
                                onClick={() => setSelectedRepo(repo)}>
                                {repo.full_name}
                            </li>
                        ))}
                    </ul>
                </div>
                <DialogFooter className="flex gap-5">
                    <DialogClose>Cancel</DialogClose>
                    <Button onClick={() => saveRepoToDb()}>Add</Button>
                </DialogFooter>
            </DialogContent>

        </Dialog>
    )
}

export default RepoDialog