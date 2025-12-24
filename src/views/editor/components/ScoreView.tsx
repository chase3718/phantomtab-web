import './scoreView.scss';
import { useScore } from '../../../hooks/useScore';
import type Part from '../../../model/part';
import type Measure from '../../../model/measure';

// We only have horizontal screen view for now
export default function ScoreView() {
	const { score } = useScore();

	return (
		<div id="Score">
			<span id="Score__Header">
				<h1>{score.title}</h1>
			</span>
			<span id="Score__PartView">
				{score.getParts().map((part) => {
					return <ScorePartView key={part.id} part={part} />;
				})}
			</span>
		</div>
	);
}

const ScorePartView = ({ part }: { part: Part }) => {
	return (
		<div id={`Score__PartView__part-${part.id}`} className="Score__PartView__part">
			<h2 className={`Score__PartView__part-${part.id}-header`}>{part.name}</h2>
			<div id={`Score__PartView__part-${part.id}__measures`} className="Score__PartView__measures">
				{part.measures.map((measure, index) => {
					return <ScoreMeasureView key={measure.id} measure={measure} index={index} />;
				})}
			</div>
		</div>
	);
};

const ScoreMeasureView = ({ measure, index }: { measure: Measure; index: number }) => {
	const staffLineSpacing = 10; // pixels between staff lines
	const measureWidth = 200; // width of measure in pixels
	const staffHeight = staffLineSpacing * 4; // 5 lines, 4 spaces
	const barlineStrokeWidth = 2;

	return (
		<div className="Score__PartView__measure">
			{/* Draw staff */}
			<svg
				className="Score__PartView__measure__staff-lines"
				width={measureWidth}
				height={staffHeight}
				viewBox={`0 0 ${measureWidth} ${staffHeight}`}
			>
				{/* Staff Lines */}
				{[0, 1, 2, 3, 4].map((lineIndex) => (
					<line
						key={lineIndex}
						x1="0"
						y1={lineIndex * staffLineSpacing}
						x2={measureWidth}
						y2={lineIndex * staffLineSpacing}
						stroke="black"
						strokeWidth="1"
					/>
				))}

				{/* Barlines */}
				{/* Start barline */}

				{measure.getPrevious() === null ? (
					<>
						<line
							x1="0"
							y1="0"
							x2="0"
							y2={staffHeight}
							stroke="black"
							strokeWidth={barlineStrokeWidth * 2}
							className="barline barline--start-bold"
						/>
						<line
							x1="4"
							y1="0"
							x2="4"
							y2={staffHeight}
							stroke="black"
							strokeWidth={barlineStrokeWidth}
							className="barline barline--start"
						/>
					</>
				) : (
					<line
						x1="0"
						y1="0"
						x2="0"
						y2={staffHeight}
						stroke="black"
						strokeWidth={barlineStrokeWidth}
						className="barline barline--start"
					/>
				)}
				{/* End barline */}
				{measure.getNext() === null && (
					<>
						<line
							x1={measureWidth - 4}
							y1="0"
							x2={measureWidth - 4}
							y2={staffHeight}
							stroke="black"
							strokeWidth={barlineStrokeWidth}
							className="barline barline--end"
						/>
						<line
							x1={measureWidth}
							y1="0"
							x2={measureWidth}
							y2={staffHeight}
							stroke="black"
							strokeWidth={barlineStrokeWidth * 2}
							className="barline barline--end-bold"
						/>
					</>
				)}
			</svg>
			{/* Measure Number */}
			<div className="Score__PartView__measure__number"> {index + 1} </div>
		</div>
	);
};
