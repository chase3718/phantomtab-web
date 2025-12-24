import { BARLINE_STROKE_WIDTH, STAFF_HEIGHT } from './constants';

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
				<>
					<line
						x1={startXOffset}
						y1="0"
						x2={startXOffset}
						y2={STAFF_HEIGHT}
						stroke="black"
						strokeWidth={BARLINE_STROKE_WIDTH * 2}
						className="barline barline--start-bold"
					/>
					<line
						x1={startXOffset + 4}
						y1="0"
						x2={startXOffset + 4}
						y2={STAFF_HEIGHT}
						stroke="black"
						strokeWidth={BARLINE_STROKE_WIDTH}
						className="barline barline--start"
					/>
				</>
			) : (
				<line
					x1={startXOffset}
					y1="0"
					x2={startXOffset}
					y2={STAFF_HEIGHT}
					stroke="black"
					strokeWidth={BARLINE_STROKE_WIDTH}
					className="barline barline--start"
				/>
			)}

			{/* End barline */}
			{isLastMeasure && (
				<>
					<line
						x1={measureWidth - 4}
						y1="0"
						x2={measureWidth - 4}
						y2={STAFF_HEIGHT}
						stroke="black"
						strokeWidth={BARLINE_STROKE_WIDTH}
						className="barline barline--end"
					/>
					<line
						x1={measureWidth}
						y1="0"
						x2={measureWidth}
						y2={STAFF_HEIGHT}
						stroke="black"
						strokeWidth={BARLINE_STROKE_WIDTH * 2}
						className="barline barline--end-bold"
					/>
				</>
			)}
		</>
	);
}
