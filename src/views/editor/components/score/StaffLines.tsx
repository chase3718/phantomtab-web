import { STAFF_LINE_SPACING } from './constants';

interface StaffLinesProps {
	width: number;
}

export default function StaffLines({ width }: StaffLinesProps) {
	return (
		<>
			{[0, 1, 2, 3, 4].map((lineIndex) => (
				<line
					key={lineIndex}
					x1="0"
					y1={lineIndex * STAFF_LINE_SPACING}
					x2={width}
					y2={lineIndex * STAFF_LINE_SPACING}
					stroke="black"
					strokeWidth="1"
				/>
			))}
		</>
	);
}
