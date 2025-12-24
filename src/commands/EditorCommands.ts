import type { Command } from './Command';
import Editor from '../model/editor';

/**
 * Command to select a beat in the editor (supports undo)
 */
export class SelectBeatCommand implements Command {
	private editor: Editor;
	private newBeatId: string | null;
	private previousBeatId: string | null = null;

	constructor(editor: Editor, beatId: string | null) {
		this.editor = editor;
		this.newBeatId = beatId;
	}

	execute(): void {
		this.previousBeatId = this.editor.getSelectedBeat();
		this.editor.setSelectedBeat(this.newBeatId);
	}

	undo(): void {
		this.editor.setSelectedBeat(this.previousBeatId);
	}

	getDescription(): string {
		return this.newBeatId ? `Select beat ${this.newBeatId}` : 'Clear beat selection';
	}
}
