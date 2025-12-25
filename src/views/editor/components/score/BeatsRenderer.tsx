import type Measure from '../../../../model/measure';
import { BEAT_PADDING, STAFF_HEIGHT, STAFF_LINE_SPACING } from './constants';
import { getBeatVisualWidth, getMeasureLayout } from './utils';

interface BeatsRendererProps {
	measure: Measure;
}

export default function BeatsRenderer({ measure }: BeatsRendererProps) {
	const { contentStartX } = getMeasureLayout(measure);

	// Visuals
	const rectHeight = STAFF_LINE_SPACING * 2.5;
	const rectY = STAFF_HEIGHT / 2 - rectHeight / 2;

	const beats = measure.getAllBeats();

	const getBeatsXPositions = () => {
		const positions: number[] = [];
		let currentX = contentStartX;
		beats.forEach((beat, i) => {
			positions.push(currentX);
			const w = getBeatVisualWidth(beat);
			currentX += w + (i < beats.length - 1 ? BEAT_PADDING : 0);
		});
		return positions;
	};

	const xPositions = getBeatsXPositions();

	return (
		<g aria-label="beats">
			{beats.map((beat, i) => {
				const w = getBeatVisualWidth(beat);
				const rx = xPositions[i];
				return (
					<rect
						key={beat.id}
						x={rx}
						y={rectY}
						width={Math.max(0, Number.isFinite(w) ? w : 0)}
						height={rectHeight}
						fill="rgba(0, 0, 255, 0.12)"
						stroke="rgba(0, 0, 255, 0.35)"
					/>
				);
			})}
		</g>
	);
}
