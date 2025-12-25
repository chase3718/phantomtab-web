import Measure from '../../../../model/measure';
import StaffLines from './StaffLines';
import BeatsRenderer from './BeatsRenderer';

type MeasureRendererProps = {
	measure: Measure;
	width: number;
	yOffset?: number;
	partCount: number;
};

export default function MeasureRenderer({ measure, width, yOffset = 0, partCount }: MeasureRendererProps) {
	return (
		<g transform={`translate(0, ${yOffset})`}>
			<StaffLines width={width} />
			<BeatsRenderer measureWidth={width} measure={measure} partCount={partCount} />
		</g>
	);
}
