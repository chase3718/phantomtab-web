import type { Clef } from '../../../../types';
import { STAFF_HEIGHT, CLEF_FONT_SIZE, CLEF_WIDTH, CLEF_LEFT_MARGIN } from './constants';
import { SMuFL } from './smufl';
import StaffLines from './StaffLines';

interface ClefRendererProps {
	x?: number;
	yOffset?: number;
	clefType?: Clef;
}

export default function ClefRenderer({ x = 0, clefType = 'treble', yOffset = 0 }: ClefRendererProps) {
	let glyph: string;
	let cleffOffset = 0;

	switch (clefType) {
		case 'treble':
			glyph = SMuFL.gClef;
			cleffOffset = STAFF_HEIGHT / 2 + yOffset + 6; // G clef centered on G line (second line from bottom)
			break;
		case 'bass':
			glyph = SMuFL.fClef;
			cleffOffset = STAFF_HEIGHT / 2 - 5; // F clef centered on F line (second line from top)
			break;
		case 'alto':
			glyph = SMuFL.cClef;
			cleffOffset = STAFF_HEIGHT / 2; // C clef centered on middle line
			break;
		default:
			glyph = SMuFL.gClef;
			cleffOffset = STAFF_HEIGHT / 2 + 5;
	}

	return (
		<svg className="Score__PartView__clef" width={CLEF_WIDTH + CLEF_LEFT_MARGIN} height={'100%'}>
			<StaffLines width={CLEF_WIDTH + CLEF_LEFT_MARGIN} yOffset={yOffset} />
			<text
				x={x + CLEF_LEFT_MARGIN}
				y={cleffOffset}
				fontFamily="Bravura"
				fontSize={CLEF_FONT_SIZE}
				textAnchor="start"
				dominantBaseline="central"
				fill="black"
				transform="sclae(0.5)"
			>
				{glyph}
			</text>
		</svg>
	);
}
