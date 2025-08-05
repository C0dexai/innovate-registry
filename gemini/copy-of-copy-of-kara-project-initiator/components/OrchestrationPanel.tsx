
import React, { useState } from 'react';
import { GithubCommit, ActivityLog } from '../types';
import { Tabs, Tab } from './ui/Tabs';
import { CodeBracketIcon } from './icons/CodeBracketIcon';
import { SparklesIcon } from './icons/SparklesIcon';

interface OrchestrationPanelProps {
    commits: GithubCommit[];
    activityLog: ActivityLog[];
}

const CommitHistory: React.FC<{ commits: GithubCommit[] }> = ({ commits }) => (
    <ul className="space-y-3">
        {commits.map(commit => (
            <li key={commit.sha} className="flex items-start gap-3 text-sm">
                {commit.author?.avatar_url && (
                    <img src={commit.author.avatar_url} alt={commit.author.login} className="w-8 h-8 rounded-full flex-shrink-0" />
                )}
                <div className="flex-grow">
                    <p className="text-dark-base-content/90 break-words">{commit.commit.message}</p>
                    <p className="text-dark-base-content/60 text-xs">
                        <span className="font-semibold">{commit.commit.author.name}</span> committed on {new Date(commit.commit.author.date).toLocaleDateString()}
                    </p>
                </div>
                <a href={commit.html_url} target="_blank" rel="noopener noreferrer" className="font-mono text-xs text-brand-accent hover:underline flex-shrink-0">
                    {commit.sha.substring(0, 7)}
                </a>
            </li>
        ))}
    </ul>
);

const ActivityLogView: React.FC<{ logs: ActivityLog[] }> = ({ logs }) => {
    const logTypeClasses = {
        info: 'text-dark-base-content/70',
        success: 'text-neon-green',
        error: 'text-brand-secondary',
    };
    return (
        <ul className="space-y-2 font-mono text-xs">
            {logs.map(log => (
                <li key={log.id} className="flex gap-2">
                    <span className="text-dark-base-content/50">{log.timestamp}</span>
                    <span className={logTypeClasses[log.type]}>{log.message}</span>
                </li>
            ))}
        </ul>
    );
};


const OrchestrationPanel: React.FC<OrchestrationPanelProps> = ({ commits, activityLog }) => {
    return (
        <div className="h-full bg-dark-base-100/50 border border-dark-base-300/30 rounded-lg flex flex-col">
            <div className="flex-grow overflow-y-auto p-4">
                 <Tabs>
                    <Tab label={`History (${commits.length})`} icon={<CodeBracketIcon className="w-4 h-4" />}>
                       {commits.length > 0 ? (
                           <CommitHistory commits={commits} />
                       ) : (
                           <p className="text-sm text-dark-base-content/60 text-center py-4">No commit history for this file.</p>
                       )}
                    </Tab>
                    <Tab label="Activity Log" icon={<SparklesIcon className="w-4 h-4" />}>
                        {activityLog.length > 0 ? (
                            <ActivityLogView logs={activityLog} />
                        ) : (
                           <p className="text-sm text-dark-base-content/60 text-center py-4">No recent activity.</p>
                        )}
                    </Tab>
                 </Tabs>
            </div>
        </div>
    );
};

export default OrchestrationPanel;
