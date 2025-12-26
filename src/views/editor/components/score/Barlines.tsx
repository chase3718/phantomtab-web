import { memo } from 'react';
import { STAFF_HEIGHT } from './constants';
import { SMuFL } from './smufl';

interface BarlinesProps {
	measureWidth: number;
	isLastMeasure: boolean;
	yOffset: number;
}

function Barlines({ measureWidth, isLastMeasure, yOffset }: BarlinesProps) {
	return (
		<>
			{/* Start barline */}

			<text
				x={measureWidth}
				y={STAFF_HEIGHT - 9 + yOffset}
				fontFamily="Bravura"
				fontSize="40"
				textAnchor="end"
				dominantBaseline="central"
				fill="black"
			>
				{isLastMeasure ? SMuFL.barlineDouble : SMuFL.barlineSingle}
			</text>
		</>
	);
}

export default memo(Barlines);
