import React, { useState } from 'react'
import { TestCase } from './UserRepoList'
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import { Play, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';
import TestCaseSettingDialog from './TestCaseSettingDialog';
import TestExecutionModal from './TestCaseExecutionModal';

type Props = {
    testCases: TestCase[];
    onReload: (repoId: string | number) => void;
    baseUrl?: string;
}

const normalizeBaseUrl = (value: string) => {
    const trimmed = String(value || '').trim();
    if (!trimmed) return null;

    const withProtocol = /^[a-zA-Z][a-zA-Z\d+.-]*:\/\//.test(trimmed)
        ? trimmed
        : `https://${trimmed}`;

    try {
        const parsed = new URL(withProtocol);
        if (!['http:', 'https:'].includes(parsed.protocol)) {
            return null;
        }
        return parsed.toString().replace(/\/$/, '');
    } catch {
        return null;
    }
};

function TestCaseList ({testCases,onReload,baseUrl}:Props) {
    const [selectedTestCases,setSelectedTestCases]=useState<TestCase[]>([]);
    const [isRunningSelected,setIsRunningSelected]=useState(false);
    const [runError,setRunError]=useState<string | null>(null);
    const [isExecutionModalOpen, setIsExecutionModalOpen] = useState(false);

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

    const handleRunSelected = async () => {
        if (selectedTestCases.length === 0) return;

        const normalizedBaseUrl = normalizeBaseUrl(baseUrl ?? "");
        if (!normalizedBaseUrl) {
            setRunError('Please set a valid http/https target domain before running the selected tests.');
            return;
        }

        setIsRunningSelected(true);
        setRunError(null);
        setIsExecutionModalOpen(true);
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
                    <div className="flex gap-4 items-center">
                        <Badge variant={'secondary'}>{testCase?.type}</Badge>
                        {testCase?.status=="failed" && (
                            <Badge variant={'destructive'} className="text-red-200 font-normal">{testCase.status}</Badge>
                        )}
                        {testCase?.status=="failed" && (
                            <Badge variant={'default'} className="text-green-200 font-normal">{testCase.status}</Badge>
                        )}
                        {testCase?.status=="running" && (
                            <Badge variant={'default'} className="text-yellow-200 font-normal">{testCase.status}</Badge>
                        )}
                        <TestCaseSettingDialog testCase={testCase} setReload={onReload} />
                    </div>
                </div>
               
            ))}
            <div className=" p-4 flex items-center justify-between">
                <div>
                    <h2>Run selected test cases</h2>
                    {runError && <p className="text-xs text-red-600 mt-1">{runError}</p>}
                </div>
                <Button disabled={selectedTestCases?.length===0 || isRunningSelected} onClick={handleRunSelected}>
                    {isRunningSelected ? 'Running...' : <><Play className="h-4 w-4 mr-3"/> Run selected</>}
                </Button>
            </div>
        </div>

        <TestExecutionModal
            isOpen={isExecutionModalOpen}
            onClose={() => {
                setIsExecutionModalOpen(false);
                setIsRunningSelected(false);
            }}
            testCases={selectedTestCases}
            repository={{ targetDomain: baseUrl ?? "" }}
            autoStart
        />
    </div>
  )
}

export default TestCaseList