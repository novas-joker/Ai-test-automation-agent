import React, { useContext, useState } from 'react'
import { UserRepo } from './WorkspaceBody'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import Image from 'next/image'
import { CheckCircle2, ListChecks, Loader2, Loader2Icon, Sparkles, TrendingUp, XCircle } from 'lucide-react'
import { Button } from '../ui/button'
import axios from 'axios'
import { UserDetailsContext } from '@/context/UserDetailsContext'
import TestCaseList from './TestCaseList'

type props={
    repoList:UserRepo[]
}

export type TestCase = {
    id: number;
    title: string;
    description: string;
    type: string;
    repoId: number;
    targetFiles:string[];
    expectedResult:string;
    repoName:string;
    repoOwner:string;
    targetRoute:string;
}
type StatusData = {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    passRate: number;

}
function UserRepoList({repoList}:props) {
    const [statusData,setStatusData] = useState<StatusData>(
        {
            totalTests: 0,
            passedTests: 0,
            failedTests: 0,
            passRate: 0
        }
    )
  
    const {userDetail}=useContext(UserDetailsContext);
    const [loading,setLoading] = useState(false);
    const [testCasesLoading,setTestCasesLoading] = useState(false);
    const [testCases,setTestCases] = useState<TestCase[]>([]);

    const handelGenerateTestCases= async(repo: UserRepo)=>{
        setLoading(true);
        const payload = {
            userId: userDetail?.id,
            repoId: repo?.repoId ?? repo?.id,
            owner: repo.owner,
            repo: repo.name ?? repo.fullName,
            branch: repo.defaultBranch ?? (repo as any).default_branch ?? "main",
        };
        console.log('Generate test cases payload:', payload);
        if (!payload.userId) {
            console.error('Generate test cases failed: missing userId');
            setLoading(false);
            return;
        }

        try {
            const result = await axios.post('/api/generate-test-cases', payload);
            console.log(result.data);
        } catch (error: any) {
            if (error.response?.data) {
                console.error('Generate test cases API error:', error.response.data);
            } else {
                console.error('Generate test cases request failed:', error);
            }
        } finally {
            setLoading(false);
        }
    }
    const getTestCases =async (repoId:number)=>{
        //get test cases
        setTestCasesLoading(true);
        setTestCases([]);
        const result = await axios.get(`/api/test-cases?repoId=${repoId}`);
        console.log(result.data);
        setStatusData({
            totalTests:result.data.length,
            passedTests:0,
            failedTests:0,
            passRate:0

        })
        setTestCases(result.data.testCases ?? []);
        setTestCasesLoading(false);
    }
  return (
    <div className="mt-10 gap-10">
     
        <Accordion type="single" collapsible
        onValueChange={(value)=>getTestCases(Number(value))}>
        {repoList.map((repo,index)=>(

            <AccordionItem key={repo.repoId} value={(repo.repoId.toString())} 
            className="border border-slate-200/80 bg-white/90 dark:border-slate-700/80 dark:bg-slate-950/70 p-5 rounded-xl shadow-sm backdrop-blur-sm">
                <AccordionTrigger>
                    <div className="flex items-center gap-2">
                        <Image src={"/github.png"} alt="github" width={20} height={20} />
                        <div className="flex flex-col items-start gap-1">
                            <h2 className="text-slate-900 dark:text-slate-100">{repo.fullName}</h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{repo.defaultBranch} • {repo.language}</p>
                        </div>
                    </div>
                </AccordionTrigger>
                <AccordionContent>
                    <div className="pt-4 space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                           
                                        <StatusCard title="Total Tests" value={statusData?.totalTests} icon={<ListChecks className="h-5 w-5 text-slate-700 dark:text-slate-100" />} bgColor="bg-blue-50 dark:bg-blue-950/40" />
                                        <StatusCard title="Passed" value={statusData?.passedTests} icon={<CheckCircle2 className="h-5 w-5 text-slate-700 dark:text-slate-100" />} bgColor="bg-green-50 dark:bg-green-950/40" />
                                        <StatusCard title="Failed" value={statusData?.failedTests} icon={<XCircle className="h-5 w-5 text-slate-700 dark:text-slate-100" />} bgColor="bg-red-50 dark:bg-red-950/40" />
                                        <StatusCard title="Pass Rate" value={statusData?.passRate} icon={<TrendingUp className="h-5 w-5 text-slate-700 dark:text-slate-100" />} bgColor="bg-purple-50 dark:bg-purple-950/40" />
                                   
                        </div>
                        {
                            !testCasesLoading && testCases.length > 0 && <TestCaseList testCases={testCases} onReload={(repoId:number)=>getTestCases(repoId)}/>
                        }
                        {
                        testCasesLoading? 
                        <h2 className='flex gap-3 items-center'>
                            <Loader2Icon className="animate-spin"/> Loading test cases...</h2>: 
                        testCases?.length== 0 && <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-slate-200/80 rounded-xl p-4 bg-slate-50 dark:border-slate-700/80 dark:bg-slate-900/80">
                            <div>
                                <h3 className="font-medium text-slate-900 dark:text-slate-100">Generate AI Test Cases</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Analyze this repository and generate automated test cases using AI.</p>
                            </div>
                            <Button className="gap-2"
                                disabled={loading}
                                onClick={()=>handelGenerateTestCases(repo)}>
                                {loading?<Loader2 className="animate-spin"/>:<Sparkles className="h-4 w-4 text-slate-50"/>}
                                Generate Test Cases
                            </Button>
                        </div>
                        }
                    </div>
                </AccordionContent>
            </AccordionItem>
        
      ))}
      </Accordion>
    </div>
  )
}

function StatusCard({
    title,
    value,
    icon,
    bgColor
}:{
    title: string
    value: string | number
    icon: React.ReactNode
    bgColor: string
}){
    return (
        <div className="border border-slate-200/80 rounded-xl p-4 flex items-center justify-between bg-slate-50 text-slate-900 dark:border-slate-700/80 dark:bg-slate-950/80 dark:text-slate-100">
            <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    {title}
                </p>
                <h3 className="text-2xl font-semibold mt-1">
                    {value}
                </h3>
            </div>
            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${bgColor}`}>{icon}</div>
        </div>
    )
}

export default UserRepoList