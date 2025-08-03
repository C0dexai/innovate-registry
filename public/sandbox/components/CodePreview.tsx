import React, { useEffect, useRef } from 'react';
import { EditorView, keymap } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { javascript } from '@codemirror/lang-javascript';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';
import { indentWithTab } from '@codemirror/commands';

interface CodeEditorProps {
    value: string;
    language: 'html' | 'css' | 'javascript' | 'markdown';
    onChange: (value: string) => void;
    onSave?: (value: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ value, language, onChange, onSave }) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const viewRef = useRef<EditorView | null>(null);

    useEffect(() => {
        if (!editorRef.current) return;

        const langExtension = {
            javascript: javascript({ jsx: true }),
            html: html(),
            css: css(),
            markdown: markdown(),
        }[language];
        
        const keyMapExtensions = [indentWithTab];
        if (onSave) {
            keyMapExtensions.push({
                key: 'Mod-s',
                preventDefault: true,
                run: (view: EditorView) => {
                    onSave(view.state.doc.toString());
                    return true;
                }
            })
        }

        const state = EditorState.create({
            doc: value,
            extensions: [
                langExtension,
                oneDark,
                keymap.of(keyMapExtensions),
                EditorView.lineWrapping,
                EditorView.updateListener.of((update) => {
                    if (update.docChanged) {
                        onChange(update.state.doc.toString());
                    }
                }),
            ],
        });

        const view = new EditorView({
            state,
            parent: editorRef.current,
        });

        viewRef.current = view;

        return () => {
            view.destroy();
            viewRef.current = null;
        };
    // Re-create the editor only when the language or onSave changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [language, onSave]);

    useEffect(() => {
        const view = viewRef.current;
        if (view && value !== view.state.doc.toString()) {
            view.dispatch({
                changes: { from: 0, to: view.state.doc.length, insert: value },
            });
        }
    }, [value]);

    return <div ref={editorRef} className="h-full w-full overflow-hidden" />;
};

export default CodeEditor;