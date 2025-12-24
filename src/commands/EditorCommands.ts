import type { Command } from './Command';
import Editor from '../model/editor';

/**
 * Command to select a beat in the editor (supports undo)
 */
export class SelectComponentCommand implements Command {
	private editor: Editor;
	private newComponentId: string | null;
	private previousComponentId: string | null = null;

	constructor(editor: Editor, componentId: string | null) {
		this.editor = editor;
		this.newComponentId = componentId;
	}

	execute(): void {
		this.previousComponentId = this.editor.getSelectedId();
		this.editor.setSelectedId(this.newComponentId);
	}

	undo(): void {
		this.editor.setSelectedId(this.previousComponentId);
	}

	getDescription(): string {
		return this.newComponentId ? `Select component ${this.newComponentId}` : 'Clear component selection';
	}
}
