import { useEffect, useState, useRef, useCallback } from 'react';
import { CommandHistory, type HistoryState } from './../commands/CommandHistory';
import type { Command } from '../commands';

/**
 * Custom hook for managing command history with undo/redo
 */
export function useCommandHistory() {
	const historyRef = useRef<CommandHistory>(new CommandHistory());
	const [state, setState] = useState<HistoryState>({
		canUndo: false,
		canRedo: false,
		undoDescription: null,
		redoDescription: null,
		historySize: 0,
		currentIndex: -1,
	});

	// Subscribe to history changes
	useEffect(() => {
		const unsubscribe = historyRef.current.subscribe((newState) => {
			setState(newState);
		});

		return unsubscribe;
	}, []);

	const execute = useCallback((command: Command) => {
		historyRef.current.execute(command);
	}, []);

	const undo = useCallback(() => {
		return historyRef.current.undo();
	}, []);

	const redo = useCallback(() => {
		return historyRef.current.redo();
	}, []);

	const clear = useCallback(() => {
		historyRef.current.clear();
	}, []);

	const getHistory = useCallback(() => {
		return historyRef.current;
	}, []);

	return {
		// State
		canUndo: state.canUndo,
		canRedo: state.canRedo,
		undoDescription: state.undoDescription,
		redoDescription: state.redoDescription,
		historySize: state.historySize,
		currentIndex: state.currentIndex,

		// Actions
		execute,
		undo,
		redo,
		clear,

		// Method to access raw history object (if needed for advanced usage)
		getHistory,
	};
}
