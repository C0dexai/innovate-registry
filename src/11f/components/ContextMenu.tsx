
import React, { useEffect, useRef } from 'react';
import type { ContextMenuItem } from '../types';

interface ContextMenuProps {
    x: number;
    y: number;
    items: ContextMenuItem[];
    onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, items, onClose }) => {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);
    
    const handleItemClick = (action: () => void) => {
        action();
        onClose();
    }

    return (
        <div
            ref={menuRef}
            className="fixed bg-primary border border-secondary rounded-lg shadow-lg z-50 animate-fade-in text-sm"
            style={{ top: y, left: x }}
        >
            <ul className="py-1">
                {items.map((item, index) => (
                    <li key={index}>
                        <button
                            onClick={() => handleItemClick(item.action)}
                            className="w-full flex items-center px-4 py-2 text-bright-text hover:bg-accent hover:text-white"
                        >
                            <span className="mr-3">{item.icon}</span>
                            {item.label}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};
