import { useScore } from '../../../hooks/useScore';
import PartRenderer from './score/PartRenderer';
import './scoreView.scss';

export default function ScoreView() {
	const { score } = useScore();

	return (
		<div id="Score">
			<span id="Score__Header">
				<h1>{score.title}</h1>
			</span>
			<span id="Score__PartView">
				{score.parts.map((part) => (
					<PartRenderer key={part.id} part={part} />
				))}
			</span>
		</div>
	);
}
