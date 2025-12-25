import { useScore } from '../../../hooks/useScore';
import PartRenderer from './score/PartRenderer';
import './scoreView.scss';
import { useMemo } from 'react';

export default function ScoreView() {
	const { score, scoreVersion } = useScore();

	const parts = score.parts;

	const measureMaxWidths = useMemo(() => {
		const measureWidths: number[] = [];

		parts.forEach((part) => {
			part.measures.forEach((measure, index) => {
				if (measureWidths[index] === undefined) {
					measureWidths[index] = 0;
				}
				measureWidths[index] = Math.max(measureWidths[index], measure.getWidth());
			});
		});

		return measureWidths;
	}, [parts, scoreVersion]);

	return (
		<div id="Score">
			<span id="Score__Header">
				<h1>{score.title}</h1>
			</span>
			<span id="Score__PartView">
				{parts.map((part) => (
					<PartRenderer key={part.id} part={part} measureWidths={measureMaxWidths} partCount={parts.length} />
				))}
			</span>
		</div>
	);
}
