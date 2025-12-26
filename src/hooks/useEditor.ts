import { useContext } from 'react';
import { EditorContext, type EditorContextType } from '../context/editorContext.tsx';

export function useEditor(): EditorContextType {
	const context = useContext(EditorContext);

	if (!context) {
		throw new Error('useEditor must be used within an EditorProvider');
	}
	return context;
}
