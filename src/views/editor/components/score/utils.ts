import { STAFF_HEIGHT, STAFF_LINE_SPACING } from './constants';

/**
 * Converts a pitch (step and octave) to a staff position
 * Default staff is treble clef, middle C on first ledger line below staff, B4 is on middle line
 */
export const pitchToStaffPosition = (step: string, octave: number): number => {
	const stepPositions: { [key: string]: number } = {
		E: 3,
		D: 2,
		C: 1,
		B: 0,
		A: -1,
		G: -2,
		F: -3,
	};
	const octaveOffset = (octave - 5) * 7;
	const basePosition = stepPositions[step.toUpperCase()] || 0;
	return basePosition + octaveOffset; // Each octave shifts position by 7
};

/**
 * Converts a staff position to a Y coordinate
 */
export const staffPositionToY = (staffPosition: number): number => {
	return STAFF_HEIGHT / 2 - staffPosition * (STAFF_LINE_SPACING / 2);
};
