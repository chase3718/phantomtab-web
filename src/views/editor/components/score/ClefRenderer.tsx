import { STAFF_HEIGHT, CLEF_FONT_SIZE } from './constants';
import { SMuFL } from './smufl';

interface ClefRendererProps {
	x: number;
	clefType?: 'treble' | 'bass' | 'alto';
}

export default function ClefRenderer({ x, clefType = 'treble' }: ClefRendererProps) {
	let glyph: string;
	let yOffset = 0;

	switch (clefType) {
		case 'treble':
			glyph = SMuFL.gClef;
			yOffset = STAFF_HEIGHT / 2 + 40; // G clef centered on G line (second line from bottom)
			break;
		case 'bass':
			glyph = SMuFL.fClef;
			yOffset = STAFF_HEIGHT / 2 - 5; // F clef centered on F line (second line from top)
			break;
		case 'alto':
			glyph = SMuFL.cClef;
			yOffset = STAFF_HEIGHT / 2; // C clef centered on middle line
			break;
		default:
			glyph = SMuFL.gClef;
			yOffset = STAFF_HEIGHT / 2 + 5;
	}

	return (
		<text
			x={x}
			y={yOffset}
			fontFamily="Bravura"
			fontSize={CLEF_FONT_SIZE}
			textAnchor="start"
			dominantBaseline="central"
			fill="black"
			transform="scale(0.5)"
		>
			{glyph}
		</text>
	);
}
