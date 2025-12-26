import type Measure from '../../../../model/measure';

interface BeatsRendererProps {
	measureWidth: number;
	measure: Measure;
	partCount: number;
}

export default function BeatsRenderer(_props: BeatsRendererProps) {
	return (
		<g aria-label="beats">
			<text>Hello world</text>
		</g>
	);
}
