import React, { useEffect, useState } from 'react'
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
import { Button } from '../ui/button'
import { Loader2, SettingsIcon } from 'lucide-react'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { TestCase } from './UserRepoList'
import axios from 'axios'

type props={
    testCase?:TestCase
    setReload:any
}

function TestCaseSettingDialog({testCase,setReload}:props) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formTestCase,setFormTestCase]=useState(
        {
            title:testCase?.title||'',
            description:testCase?.description||'',
            targetRoute:testCase?.targetRoute||'',
            expectedResult:testCase?.expectedResult||''
        }
    );

    useEffect(() => {
        setFormTestCase({
            title: testCase?.title || '',
            description: testCase?.description || '',
            targetRoute: testCase?.targetRoute || '',
            expectedResult: testCase?.expectedResult || ''
        });
    }, [testCase]);

    const handleFieldChange = (field: keyof typeof formTestCase, value: string) => {
        setFormTestCase((prev) => ({ ...prev, [field]: value }));
    };

    const updateCase=async ()=>{
        setLoading(true);
        try {
            const result = await axios.post('/api/test-cases/settings', {
                ...formTestCase,
                testCaseId: testCase?.id
            });
            console.log(result?.data);
            setReload(testCase?.repoId);
            setIsOpen(false);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    return (
    <div>
        <Dialog open={isOpen} onOpenChange={(open) => !loading && setIsOpen(open)}>
            <DialogTrigger asChild>
                <Button size={'icon'} variant={"outline"} type="button" onClick={() => setIsOpen(true)}>
                    <SettingsIcon className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Testing Requirements</DialogTitle>
                    <DialogDescription>
                     MOdifying these parameters will change the way the test cases are generated. Please be careful while changing these parameters.
                    </DialogDescription>
                </DialogHeader>
                <div>
                    <div className="mt-5">
                        <label className="text-gray-500">TEST TITLE</label>
                        <Input value={formTestCase?.title} onChange={(e) => handleFieldChange('title', e.target.value)} placeholder="Enter test title" className="mt-1" />
                    </div>
                    <div className="mt-5">
                        <label className="text-gray-500">DESCRIPTION/ACTION</label>
                        <Textarea value={formTestCase?.description} onChange={(e) => handleFieldChange('description', e.target.value)} placeholder="Enter test description or action" className="mt-1" />
                    </div>
                    <div className="mt-5">
                        <label className="text-gray-500">TARGET ROUTE/PATH</label>
                        <Input value={formTestCase?.targetRoute} onChange={(e) => handleFieldChange('targetRoute', e.target.value)} placeholder="Target Route" className="mt-1" />
                    </div>
                    <div className="mt-5">
                        <label className="text-gray-500">EXPECTED RESULT</label>
                        <Textarea value={formTestCase?.expectedResult} onChange={(e) => handleFieldChange('expectedResult', e.target.value)} placeholder="Expected Result" className="mt-1" />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                       <Button variant={'outline'} disabled={loading}>
                        Cancel
                       </Button>
                    </DialogClose>
                    <Button onClick={updateCase} disabled={loading} className="gap-2">
                        {loading && <Loader2 className="h-3 w-3 animate-spin" />}
                        Update Case
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
  )
}

export default TestCaseSettingDialog