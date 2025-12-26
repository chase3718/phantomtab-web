import { useMemo } from 'react';
import { SMuFL } from './smufl';
import type Measure from '../../../../model/measure';
import { BEAT_CONTENT_OFFSET, STAFF_LINE_SPACING } from './constants';

function durationToGlyph(duration: number): string {
	return DurationToGlyph[duration] || SMuFL.noteheadBlack;
}

const DurationToGlyph: { [key: number]: string } = {
	1: SMuFL.noteheadWhole,
	0.5: SMuFL.noteheadHalf,
	0.25: SMuFL.noteheadBlack,
	0.125: SMuFL.noteheadBlack,
	0.0625: SMuFL.noteheadBlack,
};

interface BeatsRendererProps {
	measure: Measure;
	yOffset: number;
}

export function BeatsRenderer({ measure, yOffset }: BeatsRendererProps) {
	const beats = useMemo(() => {
		let x = BEAT_CONTENT_OFFSET;
		const elements: React.ReactElement[] = [];

		measure.measureLayout.forEach((beatsAtPosition) => {
			if (beatsAtPosition === null) {
				// Rest/silence - small spacing
				x += 2;
			} else {
				// Position with one or more beats
				const beatWidth = 20;
				const centerX = x + beatWidth / 2;

				// Render all beats at this position (potentially from multiple voices)
				beatsAtPosition.forEach((beat, voiceIndex) => {
					if (!beat.note) return;
					const glyph = durationToGlyph(beat.duration);
					const notePosition = beat.getNotePosisition(measure.clef) ?? 0;
					// Convert note position to Y coordinate
					// Each staff position is STAFF_LINE_SPACING pixels apart
					// notePosition=0 is middle line, positive=up, negative=down
					const noteY = yOffset - notePosition * (STAFF_LINE_SPACING / 2) + 21;
					// Offset multiple voices horizontally so they don't overlap
					const voiceOffsetX = centerX + (voiceIndex - (beatsAtPosition.length - 1) / 2) * 8;

					elements.push(
						<text
							x={voiceOffsetX}
							y={noteY}
							fontFamily="Bravura"
							fontSize={40}
							textAnchor="middle"
							dominantBaseline="central"
							fill="black"
							key={beat.id}
						>
							{glyph}
						</text>
					);

					// Add stems for notes that require them
					if (beat.duration < 1) {
						const stemHeight = 35;
						const stemDirection = notePosition >= 0 ? -1 : 1; // Up if on or above middle line
						const stemX = voiceOffsetX + 5.1 * stemDirection; // Stem on right side of notehead
						const stemY1 = noteY - 1 * stemDirection; // Start just above/below notehead
						const stemY2 = noteY - stemDirection * stemHeight;

						elements.push(
							<line
								x1={stemX}
								y1={stemY1}
								x2={stemX}
								y2={stemY2}
								stroke="black"
								strokeWidth={1.5}
								key={`${beat.id}-stem`}
							/>
						);
					}

					// Add ledger lines for notes outside the staff
					if (notePosition > 4 || notePosition < -4) {
						// Determine range of ledger lines needed
						const staffBottom = 4; // Bottom line of staff
						const staffTop = -4; // Top line of staff

						if (notePosition > staffBottom) {
							// Lines above staff
							for (let ledgerPos = 6; ledgerPos <= notePosition; ledgerPos += 2) {
								const ledgerY = yOffset - ledgerPos * (STAFF_LINE_SPACING / 2) + 21;
								elements.push(
									<line
										x1={voiceOffsetX - 10}
										y1={ledgerY}
										x2={voiceOffsetX + 10}
										y2={ledgerY}
										stroke="black"
										strokeWidth={1.5}
										key={`${beat.id}-ledger-${ledgerPos}`}
									/>
								);
							}
						} else if (notePosition < staffTop) {
							// Lines below staff
							for (let ledgerPos = -6; ledgerPos >= notePosition; ledgerPos -= 2) {
								const ledgerY = yOffset - ledgerPos * (STAFF_LINE_SPACING / 2) + 21;
								elements.push(
									<line
										x1={voiceOffsetX - 10}
										y1={ledgerY}
										x2={voiceOffsetX + 10}
										y2={ledgerY}
										stroke="black"
										strokeWidth={1.5}
										key={`${beat.id}-ledger-${ledgerPos}`}
									/>
								);
							}
						}
					}
				});

				x += beatWidth;
			}
		});

		return elements;
	}, [measure, yOffset]);

	return <>{beats}</>;
}
