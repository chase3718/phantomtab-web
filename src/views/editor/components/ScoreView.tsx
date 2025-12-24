import './scoreView.scss';
import { useScore } from '../../../hooks/useScore';
import PartRenderer from './score/PartRenderer';

// We only have horizontal screen view for now
export default function ScoreView() {
	const { score } = useScore();

	return (
		<div id="Score">
			<span id="Score__Header">
				<h1>{score.title}</h1>
			</span>
			<span id="Score__PartView">
				{score.getParts().map((part) => (
					<PartRenderer key={part.id} part={part} />
				))}
			</span>
		</div>
	);
}
