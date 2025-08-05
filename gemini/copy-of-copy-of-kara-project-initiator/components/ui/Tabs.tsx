import React, { useState, createContext, useContext } from 'react';

interface TabsContextType {
  activeIndex: number;
  setActiveIndex: (index: number) => void;
}

const TabsContext = createContext<TabsContextType | null>(null);

export const Tabs: React.FC<{ children: React.ReactNode[] }> = ({ children }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const tabs = React.Children.toArray(children).filter(child => React.isValidElement(child) && child.type === Tab) as React.ReactElement<TabProps>[];

  return (
    <TabsContext.Provider value={{ activeIndex, setActiveIndex }}>
      <div>
        <div className="border-b border-dark-base-300/50">
          <nav className="flex space-x-2" aria-label="Tabs">
            {tabs.map((tab, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`
                  ${activeIndex === index
                    ? 'bg-brand-secondary text-black shadow-glow-pink'
                    : 'bg-dark-base-300/50 text-dark-base-content/70 hover:bg-dark-base-300/80 hover:text-dark-base-content'
                  }
                  whitespace-nowrap py-2 px-4 rounded-t-lg font-medium text-sm flex items-center space-x-2 transition-all duration-300
                `}
              >
                {tab.props.icon}
                <span>{tab.props.label}</span>
              </button>
            ))}
          </nav>
        </div>
        <div>{tabs[activeIndex]}</div>
      </div>
    </TabsContext.Provider>
  );
};

interface TabProps {
  label: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export const Tab: React.FC<TabProps> = ({ children }) => {
  return <div className="py-4">{children}</div>;
};