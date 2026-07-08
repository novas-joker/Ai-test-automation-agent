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
import { Settings2, Settings2Icon } from 'lucide-react'
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

    const handleSaveSettings =async() => {
        const result = await axios.post('/api/userRepo/settings', {
            repoId: repo?.repoId,
            targetDomain: repoSettings.targetDomain,
            globalInstruction: repoSettings.globalInstruction
        });
        console.log(result?.data);
        setReload();
        setIsOpen(false);
    }

  return (
    <Dialog open={isOpen} onOpenChange={(open)=>setIsOpen(open)}>
        <DialogTrigger asChild>
            <Button ><Settings2 className="h-4 w-4 mr-1" />Project Config</Button>
        </DialogTrigger>
        <DialogContent>
            <DialogHeader>
                <DialogTitle className="flex gap-2 items-center"><Settings2Icon className="text-primary"/>Project/Repo Settings</DialogTitle>
            <DialogDescription>
            Configure project-level defaults used during genration of test cases. These settings will be applied to all test cases generated for this repository.
            </DialogDescription>
    </DialogHeader>
    <div>
        <div className="mt-3">
            <label className="text-gray-500">
                APP URL/DEFAULT WEBSITE
            </label>
            <Input 
                placeholder="App url/Domain" 
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
                GLOBAL TEST INSTRUCTIONS
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
        <Button variant={'outline'}>Cancel</Button>
        
        </DialogClose>
        <Button onClick={()=>handleSaveSettings()}>Save Config</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
  )
}

export default RepoSettings