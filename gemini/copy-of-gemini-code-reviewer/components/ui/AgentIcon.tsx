import React from 'react';
import { Agent } from '../../types.ts';
import { 
    SparklesIcon, HeartIcon, ChartBarIcon, LightBulbIcon, BookOpenIcon, 
    PuzzlePieceIcon, CodeBracketIcon, ScaleIcon, AcademicCapIcon, UsersIcon, ShieldCheckIcon 
} from './Icons.tsx';

export const AgentIcon: React.FC<{ agent?: Agent, className?: string }> = ({ agent, className }) => {
    const iconProps = { className: className || "w-6 h-6" };

    if (!agent) {
        return <SparklesIcon {...iconProps} />; // Default AI icon
    }

    switch (agent.name) {
        case 'Lyra':
            return <HeartIcon {...iconProps} />;
        case 'Kara':
            return <ChartBarIcon {...iconProps} />;
        case 'Sophia':
            return <LightBulbIcon {...iconProps} />;
        case 'Cecilia':
            return <BookOpenIcon {...iconProps} />;
        case 'Mistress':
            return <PuzzlePieceIcon {...iconProps} />;
        case 'Stan':
            return <CodeBracketIcon {...iconProps} />;
        case 'Dan':
            return <ScaleIcon {...iconProps} />;
        case 'Karl':
            return <AcademicCapIcon {...iconProps} />;
        case 'Sonny':
            return <UsersIcon {...iconProps} />;
        case 'GUAC':
            return <ShieldCheckIcon {...iconProps} />;
        case 'Code Reviewer':
            return <ShieldCheckIcon {...iconProps} />; // Using same as GUAC for 'review'
        default:
            return <SparklesIcon {...iconProps} />;
    }
};
