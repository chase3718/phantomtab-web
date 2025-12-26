import { memo, useMemo } from 'react';
import type Part from '../../../../model/part';
import MeasureRenderer from './MeasureRenderer';
import { useEditor } from '../../../../hooks/useEditor';
import ClefRenderer from './ClefRenderer';
import KeySigRenderer from './keySigRenderer';
import TimeSigRenderer from './TimeSigRenderer';

function PartRenderer({ part }: { part: Part }) {
	const { editor } = useEditor();
	const partLayout = useMemo(() => editor.partLayouts.get(part.id), [editor, part.id]);
	const partHeight = partLayout?.total ?? 0;
	const containerStyle = useMemo(() => ({ height: partHeight }), [partHeight]);

	console.log('Rendering PartRenderer for part:', part.id, 'with layout:', partLayout);

	return (
		<>
			<div className="ScoreView__PartRenderer" style={containerStyle}>
				<ClefRenderer clefType={part.measures[0].clef} yOffset={partLayout?.top || 0} />
				<KeySigRenderer keySignature={part.measures[0].key} yOffset={partLayout?.top || 0} />
				<TimeSigRenderer timeSignature={part.measures[0].timeSignature} yOffset={partLayout?.top || 0} />
				{part.measures.map((measure, index) => (
					<MeasureRenderer measure={measure} index={index} key={measure.id} yOffset={partLayout?.top || 0} />
				))}
			</div>
		</>
	);
}

export default memo(PartRenderer);
