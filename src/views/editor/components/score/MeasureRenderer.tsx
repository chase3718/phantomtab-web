import type Measure from '../../../../model/measure';
import { STAFF_HEIGHT, BEAT_PADDING } from './constants';
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

	return (
		<div className="Score__PartView__measure">
			{/* Measure Number */}
			<div className="Score__PartView__measure__number">{index + 1}</div>
			<svg
				className="Score__PartView__measure__staff-lines"
				width={measureWidth}
				height={STAFF_HEIGHT}
				viewBox={`0 0 ${measureWidth} ${STAFF_HEIGHT}`}
				style={{ overflow: 'visible' }}
			>
				{/* Staff Lines */}
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
			</svg>
		</div>
	);
}
