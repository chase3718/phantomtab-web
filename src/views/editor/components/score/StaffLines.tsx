import { memo } from 'react';
import { STAFF_LINE_SPACING } from './constants';

interface StaffLinesProps {
	width: number;
	yOffset?: number;
}

function StaffLines({ width, yOffset = 0 }: StaffLinesProps) {
	return (
		<g aria-label="staff-lines">
			{[0, 1, 2, 3, 4].map((lineIndex) => (
				<line
					key={lineIndex}
					x1={0}
					y1={lineIndex * STAFF_LINE_SPACING + 1 + yOffset}
					x2={width + 1}
					y2={lineIndex * STAFF_LINE_SPACING + 1 + yOffset}
					stroke="black"
					strokeWidth={1}
				/>
			))}
		</g>
	);
}

export default memo(StaffLines);
