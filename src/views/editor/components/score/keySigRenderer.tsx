import type { Key } from '../../../../types';
import { memo } from 'react';
import { KEY_SIG_FONT_SIZE, STAFF_LINE_SPACING } from './constants';
import { SMuFL } from './smufl';
import StaffLines from './StaffLines';
import { pitchToStaffPosition, staffPositionToY } from './utils';

interface KeyRendererProps {
	x?: number;
	keySignature?: Key;
	yOffset?: number;
}

// Order of accidentals for treble clef key signatures
const SHARP_ORDER: Array<{ step: string; octave: number }> = [
	{ step: 'F', octave: 5 },
	{ step: 'C', octave: 5 },
	{ step: 'G', octave: 5 },
	{ step: 'D', octave: 5 },
	{ step: 'A', octave: 5 },
	{ step: 'E', octave: 5 },
	{ step: 'B', octave: 5 },
];

const FLAT_ORDER: Array<{ step: string; octave: number }> = [
	{ step: 'B', octave: 4 },
	{ step: 'E', octave: 5 },
	{ step: 'A', octave: 4 },
	{ step: 'D', octave: 5 },
	{ step: 'G', octave: 4 },
	{ step: 'C', octave: 5 },
	{ step: 'F', octave: 4 },
];

function KeySigRenderer({ x = 0, keySignature = 0, yOffset = 0 }: KeyRendererProps) {
	if (keySignature === 0) return null;

	const isSharp = keySignature > 0;
	const accidentalGlyph = isSharp ? SMuFL.accidentalSharp : SMuFL.accidentalFlat;
	const order = isSharp ? SHARP_ORDER : FLAT_ORDER;
	const count = Math.min(Math.abs(keySignature), order.length);
	const accidentalSpacing = STAFF_LINE_SPACING * 1.4; // tuned horizontal spacing between accidentals
	const width = accidentalSpacing * count;

	return (
		<svg className="Score__PartView__keySig" width={width} height={'100%'}>
			<StaffLines yOffset={yOffset} width={width + 1} />
			<g aria-label="key-signature">
				{order.slice(0, count).map((pitch, index) => {
					const staffPos = pitchToStaffPosition(pitch.step, pitch.octave);
					const y = staffPositionToY(staffPos);
					const accX = x + index * accidentalSpacing;

					return (
						<text
							key={`${pitch.step}${pitch.octave}-${index}`}
							x={accX}
							y={y + yOffset}
							fontFamily="Bravura"
							fontSize={KEY_SIG_FONT_SIZE}
							textAnchor="start"
							dominantBaseline="central"
							fill="black"
						>
							{accidentalGlyph}
						</text>
					);
				})}
			</g>
		</svg>
		// <g aria-label="key-signature">
		// 	{order.slice(0, count).map((pitch, index) => {
		// 		const staffPos = pitchToStaffPosition(pitch.step, pitch.octave);
		// 		const y = staffPositionToY(staffPos);
		// 		const accX = x + index * accidentalSpacing;

		// 		return (
		// 			<text
		// 				key={`${pitch.step}${pitch.octave}-${index}`}
		// 				x={accX}
		// 				y={y}
		// 				fontFamily="Bravura"
		// 				fontSize={KEY_SIG_FONT_SIZE}
		// 				textAnchor="start"
		// 				dominantBaseline="central"
		// 				fill="black"
		// 			>
		// 				{accidentalGlyph}
		// 			</text>
		// 		);
		// 	})}
		// </g>
	);
}

export default memo(KeySigRenderer);
