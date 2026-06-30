import React from 'react'
import { UserRepo } from './WorkspaceBody'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import Image from 'next/image'
import { CheckCircle2, ListChecks, Sparkles, TrendingUp, XCircle } from 'lucide-react'
import { Button } from '../ui/button'

type props={
    repoList:UserRepo[]
}
function UserRepoList({repoList}:props) {
    const totalTests = 0;
    const passedTests = 0;
    const failedTests = 0;
    const passRate = totalTests > 0 ? Math.round((passedTests / totalTests)*100):0;
  return (
    <div className="mt-10">
      {repoList.map((repo,index)=>(
        <Accordion type="single" collapsible key={repo.id ?? index} className="w-full">
            <AccordionItem value={String(repo.id ?? index)} className="border border-slate-200/80 bg-white/90 dark:border-slate-700/80 dark:bg-slate-950/70 p-5 rounded-xl shadow-sm backdrop-blur-sm">
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
                           
                                        <StatusCard title="Total Tests" value={totalTests} icon={<ListChecks className="h-5 w-5 text-slate-700 dark:text-slate-100" />} bgColor="bg-blue-50 dark:bg-blue-950/40" />
                                        <StatusCard title="Passed" value={passedTests} icon={<CheckCircle2 className="h-5 w-5 text-slate-700 dark:text-slate-100" />} bgColor="bg-green-50 dark:bg-green-950/40" />
                                        <StatusCard title="Failed" value={failedTests} icon={<XCircle className="h-5 w-5 text-slate-700 dark:text-slate-100" />} bgColor="bg-red-50 dark:bg-red-950/40" />
                                        <StatusCard title="Pass Rate" value={passRate} icon={<TrendingUp className="h-5 w-5 text-slate-700 dark:text-slate-100" />} bgColor="bg-purple-50 dark:bg-purple-950/40" />
                                   
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-slate-200/80 rounded-xl p-4 bg-slate-50 dark:border-slate-700/80 dark:bg-slate-900/80">
                            <div>
                                <h3 className="font-medium text-slate-900 dark:text-slate-100">Generate AI Test Cases</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Analyze this repository and generate automated test cases using AI.</p>
                            </div>
                            <Button className="gap-2">
                                <Sparkles className="h-4 w-4 text-slate-50"/>x
                                Generate Test Cases
                            </Button>
                        </div>
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
      ))}
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