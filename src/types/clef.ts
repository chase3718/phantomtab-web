export type Clef = 'treble' | 'bass' | 'alto' | 'tenor' | CClef;

export type CClef = {
	type: 'C';
	line: number; // 1 to 5
};
