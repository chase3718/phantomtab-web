import { useMemo } from 'react';
import type Part from '../../../../model/part';
import MeasureRenderer from './MeasureRenderer';
import { useEditor } from '../../../../hooks/useEditor';
import ClefRenderer from './ClefRenderer';
import KeySigRenderer from './keySigRenderer';

export default function PartRenderer({ part }: { part: Part }) {
	const { editor } = useEditor();

	const partLayout = useMemo(() => editor.partLayouts.get(part.id), [editor, part.id]);

	return (
		<>
			<div className="ScoreView__PartRenderer" style={{ height: partLayout?.total ?? 0 }}>
				<ClefRenderer clefType={part.measures[0].clef} yOffset={partLayout?.top || 0} />
				<KeySigRenderer keySignature={part.measures[0].key} yOffset={partLayout?.top || 0} />
				{part.measures.map((measure, index) => {
					return <MeasureRenderer measure={measure} index={index} key={measure.id} yOffset={partLayout?.top || 5} />;
				})}
			</div>
			<p>{part.measures[0].key}</p>
		</>
	);
}
