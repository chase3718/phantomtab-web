import { useScore } from '../../hooks/useScore';
import { useState } from 'react';
import ScoreView from './components/ScoreView';

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

	const [benchmarkResults, setBenchmarkResults] = useState<{ ts: number } | null>(null);

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

	const runBenchmark = () => {
		// Synthetic workload: N measures * beatsPerMeasure beats
		const parts = score.getParts();
		const measures = score.getMeasureCount() || 100;
		const beatsPerMeasure = 4;
		const totalBeats = measures * beatsPerMeasure;
		const durations = new Float32Array(totalBeats).fill(1);
		const spacing = 1;
		const minW = 8;
		const measureW = 200;
		const iterations = Math.max(10, parts.length * 5);

		// JS layout (mirrors the Rust logic closely)
		const layoutTs = () => {
			let x = 0;
			const beatX = new Float32Array(totalBeats);
			const beatW = new Float32Array(totalBeats);
			let totalWeight = 0;
			for (let i = 0; i < totalBeats; i++) totalWeight += durations[i];
			const scale = totalWeight <= 0 ? 0 : Math.max(measureW / totalWeight, minW);
			for (let i = 0; i < totalBeats; i++) {
				const w = Math.max(durations[i] * spacing * scale, minW);
				beatX[i] = x;
				beatW[i] = w;
				x += w;
			}
			return { beatX, beatW, measureW };
		};

		const timeSync = (fn: () => void) => {
			const t0 = performance.now();
			fn();
			return performance.now() - t0;
		};

		const tsTime = timeSync(() => {
			for (let i = 0; i < iterations; i++) {
				layoutTs();
			}
		});

		setBenchmarkResults({ ts: tsTime });
	};

	const createLargeDataset = () => {
		const startTime = performance.now();

		// Create 10 parts
		for (let i = 0; i < 10; i++) {
			addPart();
		}

		// Add 100 measures to all parts
		for (let m = 0; m < 100; m++) {
			addMeasure();
		}

		const endTime = performance.now();
		setBenchmarkResults({ ts: endTime - startTime });
	};

	return (
		<>
			<div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', zIndex: 10, position: 'absolute', bottom: 10 }}>
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
				<button onClick={runBenchmark}>Run Benchmark</button>
				<button onClick={createLargeDataset} style={{ backgroundColor: '#FF9800', color: 'white' }}>
					Create 10 Parts × 100 Measures
				</button>
			</div>
			{/* {benchmarkResults && (
				<div style={{ margin: '12px 0', padding: '8px', backgroundColor: '#f5f5f5', borderRadius: 4 }}>
					<strong>Benchmark Results:</strong> TS: {benchmarkResults.ts.toFixed(2)}ms
				</div>
			)} */}
			<ScoreView />
		</>
	);
}

export default Editor;
