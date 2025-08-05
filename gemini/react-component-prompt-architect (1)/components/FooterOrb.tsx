import React, { useState } from 'react';

const ChevronUpIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="18 15 12 9 6 15"></polyline>
  </svg>
);

const UserIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
);
const CodeIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
);
const SlidersIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line></svg>
);
const ZapIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
);
const EyeIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
);
const ShieldIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
);


interface FooterOrbProps {
    // No props needed, it will handle its own logic
}

const navItems = [
    { id: 'identity-section', label: 'Identity', icon: UserIcon },
    { id: 'props-section', label: 'Props', icon: CodeIcon },
    { id: 'state-section', label: 'State', icon: SlidersIcon },
    { id: 'interactions-section', label: 'Interactions', icon: ZapIcon },
    { id: 'visuals-section', label: 'Visuals', icon: EyeIcon },
    { id: 'robustness-section', label: 'Robustness', icon: ShieldIcon },
];

const FooterOrb: React.FC<FooterOrbProps> = () => {
    const [isOpen, setIsOpen] = useState(false);

    const handleScrollTo = (id: string) => {
        document.getElementById(id)?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
        setIsOpen(false);
    };

    const orbGlowStyle = {
        boxShadow: `
            0 0 5px var(--color-primary-glow),
            0 0 15px var(--color-primary-glow),
            0 0 30px var(--color-primary-glow),
            0 0 60px var(--color-accent-blue)
        `,
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <div className="relative flex flex-col items-center">
                 {/* Submenu */}
                <div 
                    className={`transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}
                    style={{ marginBottom: '1rem' }}
                >
                    <div className="glass-card flex flex-col gap-1 p-2 rounded-lg">
                        {navItems.map(item => (
                             <button
                                key={item.id}
                                onClick={() => handleScrollTo(item.id)}
                                title={`Go to ${item.label}`}
                                className="flex items-center gap-3 w-full text-left p-2 rounded-md hover:bg-[var(--color-primary)] hover:text-black transition-colors duration-200 text-sm"
                            >
                                <item.icon className="w-5 h-5 flex-shrink-0" />
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Orb Button */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    style={orbGlowStyle}
                    className="w-16 h-16 rounded-full bg-[var(--color-primary)] text-black flex items-center justify-center transition-transform transform hover:scale-110 focus:outline-none"
                    aria-label="Toggle Quick Navigation"
                >
                    <ChevronUpIcon className={`w-8 h-8 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
            </div>
        </div>
    );
};

export default FooterOrb;