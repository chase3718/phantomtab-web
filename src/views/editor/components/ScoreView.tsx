import { useScore } from '../../../hooks/useScore';
import PartRenderer from './score/PartRenderer';
import './scoreView.scss';
import { useMemo } from 'react';
import { computeMeasureBaseWidth } from './score/utils';

export default function ScoreView() {
	const { score, scoreVersion } = useScore();

	const parts = score.parts;

	const measureMaxWidths = useMemo(() => {
		if (!parts.length) return [];

		const measureCount = Math.max(...parts.map((p) => p.measures.length));
		const widths: number[] = Array(measureCount).fill(0);

		for (let i = 0; i < measureCount; i++) {
			for (const part of parts) {
				const measure = part.measures[i];
				if (!measure) continue;

				const baseWidth = computeMeasureBaseWidth(measure);

				if (Number.isFinite(baseWidth) && baseWidth > 0) {
					widths[i] = Math.max(widths[i], baseWidth);
				}
			}
		}

		return widths.map((w) => w);
	}, [parts, scoreVersion]);

	return (
		<div id="Score">
			<span id="Score__Header">
				<h1>{score.title}</h1>
			</span>
			<span id="Score__PartView">
				{parts.map((part) => (
					<PartRenderer key={part.id} part={part} measureWidths={measureMaxWidths} />
				))}
			</span>
		</div>
	);
}
