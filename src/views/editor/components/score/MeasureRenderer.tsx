import type Measure from '../../../../model/measure';
import { BEAT_PADDING } from './constants';
import { calculateMeasureHeight } from './utils';
import StaffLines from './StaffLines';
import Barlines from './Barlines';
import BeatRenderer from './BeatRenderer';

interface MeasureRendererProps {
	measure: Measure;
	index: number;
}

export default function MeasureRenderer({ measure, index }: MeasureRendererProps) {
	const measureWidth =
		measure.beats.reduce((acc, beat) => acc + beat.getWidth() + BEAT_PADDING, 0) +
		(measure.getPrevious() === null ? 8 : 4);
	const isFirstMeasure = measure.getPrevious() === null;
	const isLastMeasure = measure.getNext() === null;
	const startXOffset = isFirstMeasure ? 8 : 4;

	// Calculate the required height based on notes extending beyond the staff
	const { height: svgHeight, yOffset } = calculateMeasureHeight(measure);

	return (
		<div className="Score__PartView__measure">
			{/* Measure Number */}
			<div className="Score__PartView__measure__number">{index + 1}</div>
			<svg
				className="Score__PartView__measure__staff-lines"
				width={measureWidth}
				height={svgHeight}
				viewBox={`0 ${-yOffset} ${measureWidth} ${svgHeight}`}
				style={{ overflow: 'visible' }}
			>
				{/* Staff Lines - positioned with yOffset for notes that extend above */}
				<g transform={`translate(0, ${-yOffset})`}>
					<StaffLines width={measureWidth} />

					{/* Barlines */}
					<Barlines measureWidth={measureWidth} isFirstMeasure={isFirstMeasure} isLastMeasure={isLastMeasure} />

					{/* Beats */}
					{measure.beats.map((beat, beatIndex) => {
						// Calculate x position for this beat
						const xPosition = measure.beats
							.slice(0, beatIndex)
							.reduce((acc, b) => acc + b.getWidth() + BEAT_PADDING, startXOffset);

						return <BeatRenderer key={beat.id} beat={beat} x={xPosition} beatIndex={beatIndex} />;
					})}
				</g>
			</svg>
			<p>{measure.isComplete() ? 'Complete' : 'Incomplete'}</p>
			<p>Beats: {measure.beats.length}</p>
		</div>
	);
}
