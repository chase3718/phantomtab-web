import { useEditor } from '../../hooks/useEditor';
import { useScore } from '../../hooks/useScore';
import StaffView from './components/StaffView';

function Editor() {
	const {
		score,
		addMeasure,
		scoreVersion,
		undo,
		redo,
		canUndo,
		canRedo,
		undoDescription,
		redoDescription,
		addPart,
		insertMeasure,
		removeMeasure,
	} = useScore();

	const { editor, selectBeat, editorVersion } = useEditor();
	const selectedBeatId = editor.getSelectedBeat(); // Added line to get selected beat ID

	// Quick test routines to exercise commands/undo/redo
	const runInsertRemoveSuite = () => {
		const currentCount = score.getMeasureCount();
		if (currentCount === 0) {
			addMeasure();
		}
		insertMeasure(0); // insert at start
		insertMeasure(Math.max(1, score.getMeasureCount() - 1)); // insert near end
		removeMeasure(0); // remove start
		undo(); // undo removal
		redo(); // redo removal
	};

	const runBulkAddSuite = () => {
		addPart();
		addPart();
		addMeasure();
		addMeasure();
		insertMeasure(1);
	};

	return (
		<>
			<p>
				{score.shortString()} (v{scoreVersion})
			</p>
			<div style={{ display: 'flex', gap: 8 }}>
				<button onClick={() => console.log(score)}>Log Score</button>
				<button onClick={() => addPart()}>Add part</button>
				<button onClick={() => addMeasure()}>Add measure to all parts</button>
				<button onClick={() => insertMeasure(1)}>Insert measure at position 2</button>
				<button onClick={() => removeMeasure(Math.max(0, score.getMeasureCount() - 1))}>Remove last measure</button>
				<button onClick={runInsertRemoveSuite}>Run insert/remove suite</button>
				<button onClick={runBulkAddSuite}>Run bulk add suite</button>
				<button onClick={() => undo()} disabled={!canUndo} title={undoDescription ?? undefined}>
					Undo
				</button>
				<button onClick={() => redo()} disabled={!canRedo} title={redoDescription ?? undefined}>
					Redo
				</button>
			</div>
			{score.parts.map((part) => (
				<div key={part.id} style={{ marginBottom: 24 }}>
					<h2>{part.name}</h2>
					<p>
						Instrument: {part.instrument} • Measures: {part.measures.length}
					</p>
					<StaffView
						part={part}
						version={Math.max(scoreVersion, editorVersion)}
						selectedBeatId={selectedBeatId} // Pass selectedBeatId to StaffView
						onMeasureClick={(idx) => console.log('Clicked measure', idx)}
						onBeatClick={(measureIdx, beatId) => {
							selectBeat(beatId);
							console.log('Clicked beat', measureIdx, beatId);
						}}
					/>
				</div>
			))}
		</>
	);
}

export default Editor;
