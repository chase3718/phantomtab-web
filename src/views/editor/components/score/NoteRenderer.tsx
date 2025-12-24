import type { Note } from '../../../../types';
import { pitchToStaffPosition, staffPositionToY } from './utils';

interface NoteRendererProps {
	note: Note;
	x: number;
	beatId: string;
	beatIndex: number;
}

export default function NoteRenderer({ note, x, beatId, beatIndex }: NoteRendererProps) {
	const staffPosition = pitchToStaffPosition(note.pitch.step, note.pitch.octave);
	const yPosition = staffPositionToY(staffPosition);

	const StemRenderer = () => {
		const stemHeight = 35; // arbitrary stem height
		const stemX = x + 4; // right side of the note head
		const stemY1 = yPosition; // start at note head
		const stemY2 = yPosition - stemHeight; // extend upwards

		switch (note.type) {
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
	};

	return (
		<>
			<StemRenderer />
			{Math.abs(staffPosition) > 4 && (
				<line x1={x - 6} y1={yPosition} x2={x + 6} y2={yPosition} stroke="black" strokeWidth={1} />
			)}
			<circle
				key={`${beatId}-note-${note.pitch.step}${note.pitch.octave}-${beatIndex}`}
				cx={x}
				cy={yPosition}
				r={4}
				fill="black"
			/>
		</>
	);
}
