import { STAFF_HEIGHT } from './constants';
import { SMuFL } from './smufl';

interface BarlinesProps {
	measureWidth: number;
	isFirstMeasure: boolean;
	isLastMeasure: boolean;
	startXOffset?: number;
}

export default function Barlines({ measureWidth, isFirstMeasure, isLastMeasure, startXOffset = 0 }: BarlinesProps) {
	return (
		<>
			{/* Start barline */}
			{isFirstMeasure ? (
				<></>
			) : (
				<text
					x={startXOffset}
					y={STAFF_HEIGHT}
					fontFamily="Bravura"
					fontSize="40"
					textAnchor="start"
					dominantBaseline="central"
					fill="black"
				>
					{SMuFL.barlineSingle}
				</text>
			)}

			{/* End barline */}
			{isLastMeasure && (
				<text
					x={measureWidth - 8}
					y={STAFF_HEIGHT}
					fontFamily="Bravura"
					fontSize="40"
					textAnchor="start"
					dominantBaseline="central"
					fill="black"
				>
					{SMuFL.barlineFinal}
				</text>
			)}
		</>
	);
}
