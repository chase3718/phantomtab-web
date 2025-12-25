import { STAFF_HEIGHT, TIME_SIG_FONT_SIZE } from './constants';
import { SMuFL } from './smufl';
import type { TimeSignature } from '../../../../types';

interface TimeSignatureRendererProps {
	x: number;
	timeSignature: TimeSignature;
}

const digitGlyphs: { [key: number]: string } = {
	0: SMuFL.timeSig0,
	1: SMuFL.timeSig1,
	2: SMuFL.timeSig2,
	3: SMuFL.timeSig3,
	4: SMuFL.timeSig4,
	5: SMuFL.timeSig5,
	6: SMuFL.timeSig6,
	7: SMuFL.timeSig7,
	8: SMuFL.timeSig8,
	9: SMuFL.timeSig9,
};

function renderNumber(num: number): string {
	return num
		.toString()
		.split('')
		.map((digit) => digitGlyphs[parseInt(digit)])
		.join('');
}

export default function TimeSignatureRenderer({ x, timeSignature }: TimeSignatureRendererProps) {
	const numeratorGlyphs = renderNumber(timeSignature.numerator);
	const denominatorGlyphs = renderNumber(timeSignature.denominator);

	return (
		<>
			{/* Numerator */}
			<text
				x={x}
				y={STAFF_HEIGHT / 2 - 6.6}
				fontFamily="Bravura"
				fontSize={TIME_SIG_FONT_SIZE}
				textAnchor="middle"
				dominantBaseline="central"
				fill="black"
				transform="scale(0.75)"
			>
				{numeratorGlyphs}
			</text>
			{/* Denominator */}
			<text
				x={x}
				y={STAFF_HEIGHT / 2 + 20}
				fontFamily="Bravura"
				fontSize={TIME_SIG_FONT_SIZE}
				textAnchor="middle"
				dominantBaseline="central"
				fill="black"
				transform="scale(0.75)"
			>
				{denominatorGlyphs}
			</text>
		</>
	);
}
