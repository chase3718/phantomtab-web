import { createContext, type ReactNode, useState, useCallback } from 'react';
import { Score } from '../model/score';
import Part from '../model/part';
import { useCommandHistory } from '../hooks/useCommandHistory';
import { AddMeasureCommand, AddPartCommand, InsertMeasureCommand, RemoveMeasureCommand } from '../commands';

interface ScoreContextType {
	// Core objects
	score: Score;
	scoreVersion: number;

	// History state
	canUndo: boolean;
	canRedo: boolean;
	undoDescription: string | null;
	redoDescription: string | null;

	// History actions
	undo: () => boolean;
	redo: () => boolean;
	clearHistory: () => void;

	// Score actions
	addPart: (part?: Part) => void; // create or add provided part
	addMeasure: () => void; // add one measure to all parts via command
	insertMeasure: (index: number) => void; // insert measure at specific index in all parts via command
	removeMeasure: (index: number) => void; // remove measure at specific index in all parts via command
}

const ScoreContext = createContext<ScoreContextType | null>(null);

export function ScoreProvider({ children }: { children: ReactNode }) {
	const [score] = useState(() => new Score());
	const [scoreVersion, setScoreVersion] = useState(0);
	const { canUndo, canRedo, undoDescription, redoDescription, execute, undo, redo, clear } = useCommandHistory();

	const bumpVersion = useCallback(() => {
		setScoreVersion((v) => v + 1);
	}, []);

	const withPerf = useCallback(<T,>(_label: string, fn: () => T): T => {
		return fn();
	}, []);

	// Actions executed through command history
	const addMeasure = useCallback(() => {
		withPerf('addMeasure', () => {
			execute(new AddMeasureCommand(score));
			bumpVersion();
		});
	}, [score, execute, bumpVersion]);

	const addPart = useCallback(
		(part?: Part) => {
			const p = part ?? new Part();
			withPerf('addPart', () => {
				execute(new AddPartCommand(score, p));
				bumpVersion();
			});
		},
		[score, execute, bumpVersion, withPerf]
	);

	const insertMeasure = useCallback(
		(index: number) => {
			withPerf('insertMeasure', () => {
				execute(new InsertMeasureCommand(score, index));
				bumpVersion();
			});
		},
		[score, execute, bumpVersion, withPerf]
	);

	const removeMeasure = useCallback(
		(index: number) => {
			withPerf('removeMeasure', () => {
				execute(new RemoveMeasureCommand(score, index));
				bumpVersion();
			});
		},
		[score, execute, bumpVersion, withPerf]
	);

	const value: ScoreContextType = {
		score,
		scoreVersion,
		canUndo,
		canRedo,
		undoDescription,
		redoDescription,
		undo: () => {
			const result = withPerf('undo', () => undo());
			if (result) bumpVersion();
			return result;
		},
		redo: () => {
			const result = withPerf('redo', () => redo());
			if (result) bumpVersion();
			return result;
		},
		clearHistory: () => {
			clear();
			bumpVersion();
		},
		addPart,
		addMeasure,
		insertMeasure,
		removeMeasure,
	};

	return <ScoreContext.Provider value={value}>{children}</ScoreContext.Provider>;
}

export { ScoreContext };
export type { ScoreContextType };
