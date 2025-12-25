import type Part from '../../../../model/part';
import MeasureRenderer from './MeasureRenderer';
import { calculatePartHeight } from './utils';

interface PartRendererProps {
	part: Part;
	measureWidths: number[];
	partCount: number;
}

export default function PartRenderer({ part, measureWidths, partCount }: PartRendererProps) {
	const { height: partHeight, yOffset: partYOffset } = calculatePartHeight(part.measures);
	const containerStyle: React.CSSProperties = {
		display: 'flex',
		alignItems: 'flex-start',
		gap: 0,
	};

	return (
		<div className="ScoreView__PartRenderer" style={containerStyle}>
			{part.measures.map((measure, index) => {
				const width = measureWidths[index];

				return (
					<svg key={measure.id} width={width} height={partHeight}>
						{/* Render measure content */}
						<MeasureRenderer measure={measure} width={width} yOffset={partYOffset} partCount={partCount} />
					</svg>
				);
			})}
		</div>
	);
}
