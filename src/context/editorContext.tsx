import { createContext, type ReactNode, useCallback, useMemo, useState } from 'react';
import Editor from '../model/editor';
import { useScore } from '../hooks/useScore';
import { useCommandHistory } from '../hooks/useCommandHistory';
import { SelectBeatCommand } from '../commands';

interface EditorContextType {
	// Core objects
	editor: Editor;
	editorVersion: number;

	// History state
	canUndo: boolean;
	canRedo: boolean;
	undoDescription: string | null;
	redoDescription: string | null;

	// History actions
	undo: () => boolean;
	redo: () => boolean;
	clearHistory: () => void;

	// Editor actions
	selectBeat: (beatId: string | null) => void;
	clearSelection: () => void;
}

const EditorContext = createContext<EditorContextType | null>(null);

export function EditorProvider({ children }: { children: ReactNode }) {
	const { score } = useScore();
	const [editorVersion, setEditorVersion] = useState(0);
	const { canUndo, canRedo, undoDescription, redoDescription, execute, undo, redo, clear } = useCommandHistory();

	// Keep a stable Editor instance tied to the current Score
	const editor = useMemo(() => new Editor(score), [score]);

	const bumpVersion = useCallback(() => {
		setEditorVersion((v) => v + 1);
	}, []);

	const selectBeat = useCallback(
		(beatId: string | null) => {
			execute(new SelectBeatCommand(editor, beatId));
			bumpVersion();
		},
		[editor, execute, bumpVersion]
	);

	const clearSelection = useCallback(() => {
		execute(new SelectBeatCommand(editor, null));
		bumpVersion();
	}, [editor, execute, bumpVersion]);

	const value: EditorContextType = {
		editor,
		editorVersion,
		canUndo,
		canRedo,
		undoDescription,
		redoDescription,
		undo: () => {
			const result = undo();
			if (result) bumpVersion();
			return result;
		},
		redo: () => {
			const result = redo();
			if (result) bumpVersion();
			return result;
		},
		clearHistory: () => {
			clear();
			bumpVersion();
		},
		selectBeat,
		clearSelection,
	};

	return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
}

export { EditorContext };
export type { EditorContextType };
