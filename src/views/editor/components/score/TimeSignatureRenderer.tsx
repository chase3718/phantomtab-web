interface TimeSignatureRendererProps {
	x: number;
	timeSignature: unknown;
}

export default function TimeSignatureRenderer(_props: TimeSignatureRendererProps) {
	return (
		<g aria-label="time-signature">
			<text>Hello world</text>
		</g>
	);
}
