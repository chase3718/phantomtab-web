import { useMemo } from 'react';
import type Measure from '../../../../model/measure';
import type Beat from '../../../../model/beat';
import { BEAT_PADDING, STAFF_HEIGHT, STAFF_LINE_SPACING } from './constants';
import { getBeatVisualWidth, getMeasureLayout, pitchToStaffPosition, staffPositionToY } from './utils';
import { SMuFL } from './smufl';

interface BeatsRendererProps {
	measureWidth: number;
	measure: Measure;
	partCount: number;
}

export default function BeatsRenderer({ measureWidth, measure, partCount }: BeatsRendererProps) {
	const { contentStartX } = getMeasureLayout(measure);

	const barlineStretch = useMemo(() => {
		const totalBeatWidth = measure
			.getAllBeats()
			.reduce((sum, beat) => sum + getBeatVisualWidth(beat) + BEAT_PADDING, 0);
		const difference = partCount === 1 ? 0 : measureWidth - totalBeatWidth;
		const stretchPerBeat = difference / Math.max(1, measure.getAllBeats().length);
		return stretchPerBeat;
	}, [measureWidth, measure, partCount]);

	// Visuals
	const rectHeight = STAFF_LINE_SPACING * 2.5;
	const rectY = STAFF_HEIGHT / 2 - rectHeight / 2;

	const beats = measure.getAllBeats();

	const getBeatsXPositions = () => {
		const positions: number[] = [];
		let currentX = contentStartX;
		beats.forEach((beat, i) => {
			positions.push(currentX);
			const w = getBeatVisualWidth(beat) + barlineStretch;
			currentX += w + (i < beats.length - 1 ? BEAT_PADDING : 0);
		});
		return positions;
	};

	const xPositions = getBeatsXPositions();

	return (
		<g aria-label="beats">
			{beats.map((beat, i) => {
				const w = getBeatVisualWidth(beat) + barlineStretch;
				const rx = xPositions[i];
				return (
					<g key={beat.id}>
						<NoteRenderer beat={beat} x={rx} beatWidth={w} />
					</g>
				);
			})}
		</g>
	);
}

interface NoteRendererProps {
	beat: Beat;
	x: number;
	beatWidth: number;
}

const NoteRenderer = ({ beat, x, beatWidth }: NoteRendererProps) => {
	const noteheadX = x + beatWidth / 2;

	return (
		<g aria-label="notes">
			{beat.notes.map((note, i) => {
				const staffPos = pitchToStaffPosition(note.pitch.step, note.pitch.octave);
				const y = staffPositionToY(staffPos);

				// Choose notehead based on note type
				let notehead = SMuFL.noteheadBlack;
				if (note.type === 'whole') notehead = SMuFL.noteheadWhole;
				else if (note.type === 'half') notehead = SMuFL.noteheadHalf;

				return (
					<text
						key={i}
						x={noteheadX}
						y={y}
						fontSize="40"
						fontFamily="Bravura"
						textAnchor="middle"
						dominantBaseline="central"
						fill="black"
					>
						{notehead}
					</text>
				);
			})}
		</g>
	);
};
