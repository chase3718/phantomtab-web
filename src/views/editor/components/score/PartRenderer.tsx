import type Part from '../../../../model/part';
import MeasureRenderer from './MeasureRenderer';

interface PartRendererProps {
	part: Part;
}

export default function PartRenderer({ part }: PartRendererProps) {
	return (
		<div id={`Score__PartView__part-${part.id}`} className="Score__PartView__part">
			<h2 className={`Score__PartView__part-${part.id}-header`}>{part.name}</h2>
			<div id={`Score__PartView__part-${part.id}__measures`} className="Score__PartView__measures">
				{part.measures.map((measure, index) => (
					<MeasureRenderer key={measure.id} measure={measure} index={index} />
				))}
			</div>
		</div>
	);
}
