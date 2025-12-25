import Measure from '../../../../model/measure';
import Barlines from './Barlines';
import ClefRenderer from './ClefRenderer';
import { CLEF_WIDTH, CLEF_LEFT_MARGIN, KEY_SIGNATURE_WIDTH_MOD, KEY_TO_TIME_MARGIN } from './constants';
import KeyRenderer from './KeyRenderer';
import StaffLines from './StaffLines';
import TimeSignatureRenderer from './TimeSignatureRenderer';
import BeatsRenderer from './BeatsRenderer';

type MeasureRendererProps = {
	measure: Measure;
	forcedWidth: number;
	yOffset?: number;
	partCount: number;
};

export default function MeasureRenderer({ measure, forcedWidth, yOffset = 0, partCount }: MeasureRendererProps) {
	// Precompute key sig width for x offsets only (width is provided via layout)
	const keySigWidth = measure.key !== 0 ? KEY_SIGNATURE_WIDTH_MOD * Math.min(Math.abs(measure.key), 7) : 0;
	const width = forcedWidth;

	return (
		<g transform={`translate(0, ${yOffset})`}>
			{/* Render the staff lines */}
			{measure.previous == null && (
				<>
					<ClefRenderer x={CLEF_LEFT_MARGIN} />
					<KeyRenderer x={CLEF_LEFT_MARGIN + CLEF_WIDTH} keySignature={measure.key} />
					<TimeSignatureRenderer
						x={CLEF_LEFT_MARGIN + CLEF_WIDTH + keySigWidth + KEY_TO_TIME_MARGIN}
						timeSignature={measure.timeSignature}
					/>
				</>
			)}
			<StaffLines width={width} />
			<BeatsRenderer measureWidth={width} measure={measure} partCount={partCount} />
			<Barlines measureWidth={width} isFirstMeasure={false} isLastMeasure={!measure.next} />
		</g>
	);
}
