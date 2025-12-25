import type Part from '../../../../model/part';
import { STAFF_HEIGHT } from './constants';
import MeasureRenderer from './MeasureRenderer';

interface PartRendererProps {
	part: Part;
	measureWidths: number[];
	partCount: number;
}

export default function PartRenderer({ part, measureWidths, partCount }: PartRendererProps) {
	const fallbackWidth = 120;
	const verticalPadding = 20;
	const measureHeight = STAFF_HEIGHT + verticalPadding * 2;
	const containerStyle: React.CSSProperties = {
		display: 'flex',
		alignItems: 'flex-start',
		gap: 0,
	};

	return (
		<div className="ScoreView__PartRenderer" style={containerStyle}>
			{part.measures.map((measure, index) => {
				const width = measureWidths[index] ?? fallbackWidth;
				return (
					<svg key={measure.id} width={width} height={measureHeight}>
						<MeasureRenderer measure={measure} forcedWidth={width} yOffset={verticalPadding} partCount={partCount} />
					</svg>
				);
			})}
		</div>
	);
}
