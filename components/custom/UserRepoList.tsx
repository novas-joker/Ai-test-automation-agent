import React, { useContext, useState } from 'react'
import { UserRepo } from './WorkspaceBody'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import Image from 'next/image'
import { CheckCircle2, Globe2Icon, Link2Icon, ListChecks, Loader2, Loader2Icon, Settings2, Sparkles, TrendingUp, XCircle } from 'lucide-react'
import { Button } from '../ui/button'
import axios from 'axios'
import { UserDetailsContext } from '@/context/UserDetailsContext'
import TestCaseList from './TestCaseList'
import RepoSettings from './RepoSettings'

type props={
    setReload:()=>void;
    repoList:UserRepo[]
}

export type TestCase = {
    id: number;
    title: string;
    description: string;
    type: string;
    repoId: string | number;
    targetFiles:string[];
    expectedResult:string;
    repoName:string;
    repoOwner:string;
    targetRoute:string;
    status?: string | null;
    browserbaseScript?: string | null;
    logs?: string[];
    sessionId?: string | null;
    sessionUrl?: string | null;
}
type StatusData = {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    passRate: number;

}
function UserRepoList({repoList,setReload}:props) {
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
    const [errorMessage,setErrorMessage] = useState<string | null>(null);

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
    const getTestCases = async (repoId: number | string | undefined) => {
        const normalizedRepoId = String(repoId ?? '').trim();

        if (!normalizedRepoId) {
            setErrorMessage('Repository ID is missing or invalid.');
            setTestCases([]);
            setStatusData({ totalTests: 0, passedTests: 0, failedTests: 0, passRate: 0 });
            return;
        }

        setTestCasesLoading(true);
        setErrorMessage(null);
        setTestCases([]);

        try {
            const result = await axios.get('/api/test-cases', {
                params: { repoId: normalizedRepoId },
            });
            const testCasesForRepo = result.data?.testCases ?? [];
            const passedTests = testCasesForRepo.filter((testCase: TestCase) => testCase.status === 'passed').length;
            const failedTests = testCasesForRepo.filter((testCase: TestCase) => testCase.status === 'failed').length;
            const totalTests = testCasesForRepo.length;

            setStatusData({
                totalTests,
                passedTests,
                failedTests,
                passRate: totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0
            });
            setTestCases(testCasesForRepo);
          
        } catch (error: any) {
            const message = error?.response?.data?.error || error?.message || 'Failed to load test cases.';
            setErrorMessage(message);
            setTestCases([]);
            setStatusData({ totalTests: 0, passedTests: 0, failedTests: 0, passRate: 0 });
        } finally {
            setTestCasesLoading(false);
        }
    }
  return (
    <div className="mt-8 space-y-4">
      <Accordion 
        type="single" 
        collapsible
        onValueChange={(value) => {
          if (!value) {
            setTestCases([]);
            setStatusData({ totalTests: 0, passedTests: 0, failedTests: 0, passRate: 0 });
            setErrorMessage(null);
            return;
          }
          getTestCases(value);
        }}
      >
        {repoList.map((repo) => (
          <AccordionItem 
            key={repo.repoId} 
            value={repo.repoId.toString()} 
            className="border border-border bg-card/45 dark:bg-zinc-950/20 p-5 rounded-xl shadow-sm backdrop-blur-sm mb-4 last:mb-0"
          >
            <AccordionTrigger className="py-2 hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 border border-border rounded flex items-center justify-center bg-background shadow-sm">
                  <Image src="/github.png" alt="github" width={16} height={16} />
                </div>
                <div className="flex flex-col items-start gap-0.5">
                  <h3 className="font-semibold text-sm tracking-tight text-foreground">{repo.fullName}</h3>
                  <span className="text-xs text-muted-foreground font-mono">{repo.defaultBranch} • {repo.language}</span>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <div className="space-y-6">
                <div className="bg-muted/30 p-3.5 border border-border rounded-xl flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground font-mono">
                    <Globe2Icon className="h-4 w-4 text-muted-foreground" />
                    <span>target:</span>
                    <span className="bg-background border border-border px-2.5 py-0.5 rounded text-foreground text-xs font-semibold">{repo.targetDomain}</span>
                  </div>
                  <RepoSettings repo={repo} setReload={setReload} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatusCard 
                    title="Total Tests" 
                    value={statusData?.totalTests} 
                    icon={<ListChecks className="h-4 w-4 text-muted-foreground" />} 
                    bgColor="" 
                  />
                  <StatusCard 
                    title="Passed" 
                    value={statusData?.passedTests} 
                    icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />} 
                    bgColor="" 
                  />
                  <StatusCard 
                    title="Failed" 
                    value={statusData?.failedTests} 
                    icon={<XCircle className="h-4 w-4 text-destructive" />} 
                    bgColor="" 
                  />
                  <StatusCard 
                    title="Pass Rate" 
                    value={`${statusData?.passRate}%`} 
                    icon={<TrendingUp className="h-4 w-4 text-indigo-500" />} 
                    bgColor="" 
                  />
                </div>

                {errorMessage && (
                  <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs font-mono text-destructive">
                    {errorMessage}
                  </div>
                )}

                {!testCasesLoading && testCases.length > 0 && (
                  <TestCaseList 
                    testCases={testCases} 
                    onReload={(repoId: number | string) => getTestCases(repoId)} 
                    baseUrl={repo.targetDomain ?? ""} 
                  />
                )}

                {testCasesLoading ? (
                  <div className="flex items-center justify-center py-6 gap-3 text-sm font-mono text-muted-foreground">
                    <Loader2Icon className="h-4 w-4 animate-spin text-primary" />
                    Loading test cases...
                  </div>
                ) : (
                  testCases.length === 0 && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-border rounded-xl p-5 bg-muted/20">
                      <div className="space-y-1">
                        <h4 className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-primary" />
                          Generate AI Test Suite
                        </h4>
                        <p className="text-xs text-muted-foreground max-w-lg leading-relaxed">
                          Run a static analysis of this repository using Gemini to automatically draft E2E testing scenarios for all main routes.
                        </p>
                      </div>
                      <Button 
                        className="gap-2 shrink-0 font-mono text-xs shadow-sm" 
                        size="sm"
                        disabled={loading} 
                        onClick={() => handelGenerateTestCases(repo)}
                      >
                        {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                        Generate Suite
                      </Button>
                    </div>
                  )
                )}
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
}: {
  title: string
  value: string | number
  icon: React.ReactNode
  bgColor: string
}) {
  return (
    <div className="border border-border rounded-xl p-4 flex items-center justify-between bg-card/60 shadow-sm">
      <div>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
          {title}
        </p>
        <h3 className="text-2xl font-bold tracking-tight mt-1 text-foreground">
          {value}
        </h3>
      </div>
      <div className="h-8 w-8 rounded-lg flex items-center justify-center border border-border bg-muted/40 shadow-inner">
        {icon}
      </div>
    </div>
  )
}

export default UserRepoList