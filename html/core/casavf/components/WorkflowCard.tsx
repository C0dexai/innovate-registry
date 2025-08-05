
import React from 'react';
import { WorkflowTopic } from '../types';

interface WorkflowCardProps {
  topic: WorkflowTopic;
  onLearnMore: (topic: WorkflowTopic) => void;
}

const WorkflowCard: React.FC<WorkflowCardProps> = ({ topic, onLearnMore }) => {
  return (
    <div className="bg-slate-900/40 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-6 flex flex-col h-full transform transition-all duration-300 hover:scale-105 hover:bg-slate-900/60 hover:shadow-2xl hover:shadow-cyan-500/20">
      <div className="flex items-start mb-4">
        <div className="p-2 bg-slate-900/70 rounded-md mr-4 border border-cyan-500/30">
            {topic.icon}
        </div>
        <div>
            <h3 className="text-xl font-bold text-white uppercase tracking-wider">{topic.title}</h3>
            <p className="text-sm text-fuchsia-400 font-light">{topic.subtitle}</p>
        </div>
      </div>
      <ul className="space-y-2 mb-6 text-cyan-200 flex-grow font-light">
        {topic.details.map((detail, index) => (
          <li key={index} className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-fuchsia-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            <span>{detail}</span>
          </li>
        ))}
      </ul>
      <button 
        onClick={() => onLearnMore(topic)}
        className="mt-auto w-full bg-cyan-600/80 text-white font-bold py-2 px-4 rounded-md hover:bg-cyan-500 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-75 uppercase tracking-wider border border-cyan-500/50"
      >
        Kara, break it down
      </button>
    </div>
  );
};

export default WorkflowCard;