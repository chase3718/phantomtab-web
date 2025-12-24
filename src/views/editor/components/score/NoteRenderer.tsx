import type Beat from '../../../../model/beat';
import type { Note } from '../../../../types';
import { pitchToStaffPosition, staffPositionToY } from './utils';

interface NoteRendererProps {
	beat: Beat;
	note: Note;
	x: number;
	beatId: string;
	beatIndex: number;
}

interface StemRendererProps {
	noteType: Note['type'];
	x: number;
	yPosition: number;
}

function StemRenderer({ noteType, x, yPosition }: StemRendererProps) {
	const stemHeight = 35; // arbitrary stem height
	const stemX = x + 4; // right side of the note head
	const stemY1 = yPosition; // start at note head
	const stemY2 = yPosition - stemHeight; // extend upwards

	switch (noteType) {
		case 'whole':
			return null;
		case 'half':
		case 'quarter':
		case 'eighth':
		case 'sixteenth':
		case 'thirty-second':
			return <line x1={stemX} y1={stemY1} x2={stemX} y2={stemY2} stroke="black" strokeWidth={1} />;
		default:
			return null;
	}
}

function HeadRenderer({ note, x, beatId, beatIndex }: NoteRendererProps) {
	const staffPosition = pitchToStaffPosition(note.pitch.step, note.pitch.octave);
	const yPosition = staffPositionToY(staffPosition);
	let noteOffset = staffPosition < -4 ? 10 : 0;
	noteOffset = staffPosition > 4 ? -10 : 0;

	return (
		<circle
			key={`${beatId}-note-${note.pitch.step}${note.pitch.octave}-${beatIndex}`}
			cx={x}
			cy={yPosition + noteOffset}
			r={4}
			fill="black"
		/>
	);
}

function FlagRenderer({ beat, noteType }: { beat: Beat; noteType: Note['type'] }) {
	if (noteType === 'quarter' || noteType === 'half' || noteType === 'whole') {
		return null;
	}

	const flagDirection = 1; // -1 for left, 1 for right, 0 for both
}

export default function NoteRenderer({ beat, note, x, beatId, beatIndex }: NoteRendererProps) {
	const staffPosition = pitchToStaffPosition(note.pitch.step, note.pitch.octave);
	const yPosition = staffPositionToY(staffPosition);

	return (
		<>
			<FlagRenderer beat={beat} noteType={note.type} />
			<StemRenderer noteType={note.type} x={x} yPosition={yPosition} />
			{Math.abs(staffPosition) > 4 && staffPosition % 2 === 0 && (
				<line x1={x - 6} y1={yPosition} x2={x + 6} y2={yPosition} stroke="black" strokeWidth={1} />
			)}
			{/* Display ledger lines between staff and note */}
			{[...Array(Math.max(0, Math.floor((Math.abs(staffPosition) - 4) / 2))).keys()].map((i) => {
				const ledgerY = staffPosition > 0 ? staffPositionToY(4 + (i + 1) * 2) : staffPositionToY(-4 - (i + 1) * 2);
				return (
					<line
						key={`${beatId}-note-${note.pitch.step}${note.pitch.octave}-ledger-${i}`}
						x1={x - 6}
						y1={ledgerY}
						x2={x + 6}
						y2={ledgerY}
						stroke="black"
						strokeWidth={1}
					/>
				);
			})}
			<HeadRenderer note={note} x={x} beatId={beatId} beatIndex={beatIndex} />
		</>
	);
}
