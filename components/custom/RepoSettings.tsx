import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from '../ui/button'
import { Loader2, Settings2, Settings2Icon } from 'lucide-react'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { DialogClose } from '@radix-ui/react-dialog'
import { UserRepo } from './WorkspaceBody'
import axios from 'axios'
type props={
    repo:UserRepo,
    setReload:()=>void;
}

function RepoSettings({repo,setReload}:props) {
    const [repoSettings,setRepoSettings] = useState({
        targetDomain:repo?.targetDomain||'',
        globalInstruction:repo?.globalInstruction||''
    });

    const [ isOpen,setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSaveSettings =async() => {
        setLoading(true);
        try {
            const result = await axios.post('/api/userRepo/settings', {
                repoId: repo?.repoId,
                targetDomain: repoSettings.targetDomain,
                globalInstruction: repoSettings.globalInstruction
            });
            console.log(result?.data);
            setReload();
            setIsOpen(false);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

  return (
    <Dialog open={isOpen} onOpenChange={(open)=>setIsOpen(open)}>
        <DialogTrigger asChild>
            <Button ><Settings2 className="h-4 w-4 mr-1" />Project settings</Button>
        </DialogTrigger>
        <DialogContent>
            <DialogHeader>
                <DialogTitle className="flex gap-2 items-center"><Settings2Icon className="text-primary"/>Project and repository settings</DialogTitle>
            <DialogDescription>
            Configure project-level defaults used during generation of test cases. These settings will be applied to all test cases generated for this repository.
            </DialogDescription>
    </DialogHeader>
    <div>
        <div className="mt-3">
            <label className="text-gray-500">
                App URL / default website
            </label>
            <Input 
                placeholder="App URL / domain" 
                className="mt-1" 
                value={repoSettings.targetDomain} 
                onChange={(e)=>setRepoSettings({...repoSettings,targetDomain:e.target.value})}
            />
            <p className="text-xs text-gray-500 mt-1">
                This is the default domain or base URL of your application. It will be used to generate test cases and construct test URLs. For example, if your app is hosted at "https://example.com", set this field to that value.
            </p>
        </div>
        <div className="mt-3">
            <label className="text-gray-500">
                Global test instructions
            </label>
            <Textarea 
            placeholder="Global test instructions" 
            className="mt-1" value={repoSettings.globalInstruction} 
            onChange={(e)=>setRepoSettings({...repoSettings,globalInstruction:e.target.value})}
            />
            <p className="text-xs text-gray-500 mt-1">
                These instructions will be applied to all test cases generated for this repository. You can specify any specific requirements or constraints that should be considered during test case generation. For example, you might want to instruct the AI to focus on certain features, avoid certain areas of the application, or follow specific testing guidelines.
            </p>
        </div>
    </div>
    <DialogFooter>
        <DialogClose asChild >
        <Button variant={'outline'} disabled={loading}>Cancel</Button>
        </DialogClose>
        <Button onClick={()=>handleSaveSettings()} disabled={loading} className="gap-2">
            {loading && <Loader2 className="h-3 w-3 animate-spin" />}
            Save settings
        </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
  )
}

export default RepoSettings