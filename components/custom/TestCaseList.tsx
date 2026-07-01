import React, { useState } from 'react'
import { TestCase } from './UserRepoList'
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import { Play, RefreshCw, SettingsIcon } from 'lucide-react';
import { Button } from '../ui/button';

type Props = {
    testCases: TestCase[];
    onReload: (repoId: number) => void;
}
function TestCaseList ({testCases,onReload}:Props) {
    const [selectedTestCases,setSelectedTestCases]=useState<TestCase[]>([]);
    const handleSelectedTestCase = (checked: boolean | string, testCase: TestCase) => {
        if (checked) {
            setSelectedTestCases((prev) => {
                if (prev.some((tc) => tc.id === testCase.id)) {
                    return prev;
                }
                return [...prev, testCase];
            });
        } else {
            setSelectedTestCases((prev) => prev.filter((tc) => tc.id !== testCase.id));
        }
    };
  return (
    <div>
        <div className="flex items-center justify-between">
            <h2 className="font-medium text-primary">Generated Test Cases</h2>
            <Button size={'sm'} onClick={()=>onReload(testCases[0]?.repoId)}><RefreshCw className="h-3 w-3 mr-1"/>Refresh</Button>
        </div>
        <div className="border rounded-md mt-3">
            {testCases.map((testCase, index) => (
                <div key={index} className=" border-b flex items-center justify-between p-4">
                    <div className='flex gap-3 items-center'>
                        <Checkbox 
                        checked={selectedTestCases.some((tc) => tc.id === testCase.id)}
                        onCheckedChange={(checked)=>handleSelectedTestCase(checked,testCase)}
                        />
                        <div>
                            <h2>{testCase?.title}</h2>
                            <p className="text-xs text-gray-500">{testCase?.description}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Badge variant={'secondary'}>{testCase?.type}</Badge>
                        <Badge variant={'secondary'}>pending</Badge>
                        <Button size={'icon' }variant={"outline"}>
                            <SettingsIcon className="h-4 w-4 white"/>
                        </Button>
                    </div>
                </div>
               
            ))}
            <div className=" p-4 flex items-center justify-between">
                <h2>Run Selected Test Case</h2>
                <Button disabled={selectedTestCases?.length===0}><Play className="h-4 w-4 mr-3"/> Run Selected</Button>
            </div>
        </div>
    </div>
  )
}

export default TestCaseList