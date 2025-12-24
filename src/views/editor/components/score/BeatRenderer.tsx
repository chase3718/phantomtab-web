import type Beat from '../../../../model/beat';
import { STAFF_HEIGHT } from './constants';
import NoteRenderer from './NoteRenderer';

interface BeatRendererProps {
	beat: Beat;
	x: number;
	beatIndex: number;
}

export default function BeatRenderer({ beat, x, beatIndex }: BeatRendererProps) {
	const beatWidth = beat.getWidth();

	return (
		<g key={beat.id} className="Score__PartView__measure__beat" transform={`translate(${x}, 0)`}>
			{/* Visual indicator for the beat */}
			<rect
				x="0"
				y="0"
				width={beatWidth}
				height={STAFF_HEIGHT}
				fill="none"
				stroke="blue"
				strokeWidth="0.5"
				opacity="0.3"
			/>

			{/* Render notes */}
			{beat.notes.map((note) => (
				<NoteRenderer
					beat={beat}
					key={`${beat.id}-${note.pitch.step}${note.pitch.octave}`}
					note={note}
					x={beatWidth / 2}
					beatId={beat.id}
					beatIndex={beatIndex}
				/>
			))}
		</g>
	);
}
