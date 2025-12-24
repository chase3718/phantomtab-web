import { STAFF_HEIGHT, STAFF_LINE_SPACING } from './constants';
import type Measure from '../../../../model/measure';

/**
 * Converts a pitch (step and octave) to a staff position
 * Default staff is treble clef:
 * - B4 is on the middle line (position 0)
 * - C5 is one space above (position 1)
 * - C4 is one ledger line below (position -6)
 *
 * Staff lines (from top to bottom): F5(4), D5(2), B4(0), G4(-2), E4(-4)
 */
export const pitchToStaffPosition = (step: string, octave: number): number => {
	// Position of each note within its octave, with B4 at position 0
	const stepPositions: { [key: string]: number } = {
		C: 0, // C is 1 semitone above B
		D: 1, // D is 2 semitones above B
		E: 2, // E is 3 semitones above B
		F: 3, // F is 4 semitones above B
		G: 4, // G is 5 semitones below B
		A: 5, // A is 6 semitones below B
		B: 6, // B is the reference
	};
	// Each octave difference changes position by 7 (one full staff cycle)
	// Octave 4 has B4 at position 0
	const octaveOffset = (octave - 4) * 7;
	const basePosition = stepPositions[step.toUpperCase()] - 6 || 0;
	return basePosition + octaveOffset;
};

/**
 * Converts a staff position to a Y coordinate
 */
export const staffPositionToY = (staffPosition: number): number => {
	return STAFF_HEIGHT / 2 - staffPosition * (STAFF_LINE_SPACING / 2);
};

/**
 * Calculate the required height for a measure based on its notes
 * Returns { height, yOffset } where yOffset is the top padding needed
 */
export const calculateMeasureHeight = (measure: Measure): { height: number; yOffset: number } => {
	// Initialize with staff bounds (staff spans from -4 to 4 in staff position terms)
	let minStaffPosition = -4; // lowest staff line position
	let maxStaffPosition = 4; // highest staff line position

	measure.beats.forEach((beat) => {
		beat.notes.forEach((note) => {
			const position = pitchToStaffPosition(note.pitch.step, note.pitch.octave);
			minStaffPosition = Math.min(minStaffPosition, position);
			maxStaffPosition = Math.max(maxStaffPosition, position);
		});
	});

	// Calculate padding needed above and below the staff
	// Negative positions go above the staff, positive go below
	const topPadding = Math.max(0, -4 - minStaffPosition) * (STAFF_LINE_SPACING / 2);
	const bottomPadding = Math.max(0, maxStaffPosition - 4) * (STAFF_LINE_SPACING / 2);

	const totalHeight = STAFF_HEIGHT + topPadding + bottomPadding;
	const yOffset = topPadding;

	return { height: totalHeight, yOffset };
};
