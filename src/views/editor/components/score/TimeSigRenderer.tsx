import type { TimeSignature } from '../../../../types';
import { STAFF_LINE_SPACING, TIME_SIG_FONT_SIZE, TIME_SIG_HEIGHT, TIME_SIG_WIDTH } from './constants';
import { SMuFL } from './smufl';
import StaffLines from './StaffLines';

export default function TimeSigRenderer({
	timeSignature = { numerator: 4, denominator: 4 },
	yOffset = 0,
	x = 0,
}: {
	timeSignature: TimeSignature;
	yOffset?: number;
	x?: number;
}) {
	return (
		<svg className="Score__PartView__clef" width={TIME_SIG_WIDTH} height={'100%'}>
			<StaffLines width={TIME_SIG_WIDTH} yOffset={yOffset} />
			<text
				x={x}
				y={yOffset + STAFF_LINE_SPACING + 1}
				fontSize={TIME_SIG_FONT_SIZE}
				fontFamily="Bravura"
				textAnchor="start"
				dominantBaseline="central"
				fill="black"
			>
				{numberToGlyph(timeSignature.numerator)}
			</text>
			<text
				x={x}
				y={yOffset + TIME_SIG_HEIGHT + STAFF_LINE_SPACING + 1}
				fontSize={TIME_SIG_FONT_SIZE}
				fontFamily="Bravura"
				textAnchor="start"
				dominantBaseline="central"
				fill="black"
			>
				{numberToGlyph(timeSignature.denominator)}
			</text>
		</svg>
	);
}
function numberToGlyph(num: number): string {
	const numString = num.toString();
	let glyphs = '';
	for (const char of numString) {
		switch (char) {
			case '0':
				glyphs += SMuFL.timeSig0;
				break;
			case '1':
				glyphs += SMuFL.timeSig1;
				break;
			case '2':
				glyphs += SMuFL.timeSig2;
				break;
			case '3':
				glyphs += SMuFL.timeSig3;
				break;
			case '4':
				glyphs += SMuFL.timeSig4;
				break;
			case '5':
				glyphs += SMuFL.timeSig5;
				break;
			case '6':
				glyphs += SMuFL.timeSig6;
				break;
			case '7':
				glyphs += SMuFL.timeSig7;
				break;
			case '8':
				glyphs += SMuFL.timeSig8;
				break;
			case '9':
				glyphs += SMuFL.timeSig9;
				break;
			default:
				break;
		}
	}
	return glyphs;
}
