export type Note = {
	pitch: Pitch;
	type: 'whole' | 'half' | 'quarter' | 'eighth' | 'sixteenth' | 'thirty-second';
	dots: number; // Number of augmentation dots
};

type Pitch = {
	step: 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B';
	octave: number;
	alter: -2 | -1 | 0 | 1 | 2; // Number of semitone alterations (flats/sharps)
};
