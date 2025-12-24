import type { Command } from './Command';

/**
 * Manages command history with undo/redo support
 */
export class CommandHistory {
	private history: Command[] = [];
	private currentIndex: number = -1;
	private listeners: Set<(state: HistoryState) => void> = new Set();

	/**
	 * Execute a command and add it to history
	 */
	execute(command: Command): void {
		// Remove any commands after the current index (redo stack)
		this.history = this.history.slice(0, this.currentIndex + 1);

		// Execute the command
		command.execute();

		// Add to history
		this.history.push(command);
		this.currentIndex++;

		this.notifyListeners();
	}

	/**
	 * Undo the last command
	 */
	undo(): boolean {
		if (!this.canUndo()) {
			return false;
		}

		const command = this.history[this.currentIndex];
		command.undo();
		this.currentIndex--;

		this.notifyListeners();
		return true;
	}

	/**
	 * Redo the last undone command
	 */
	redo(): boolean {
		if (!this.canRedo()) {
			return false;
		}

		this.currentIndex++;
		const command = this.history[this.currentIndex];
		command.execute();

		this.notifyListeners();
		return true;
	}

	/**
	 * Check if undo is available
	 */
	canUndo(): boolean {
		return this.currentIndex >= 0;
	}

	/**
	 * Check if redo is available
	 */
	canRedo(): boolean {
		return this.currentIndex < this.history.length - 1;
	}

	/**
	 * Get the description of the last command that can be undone
	 */
	getUndoDescription(): string | null {
		if (!this.canUndo()) {
			return null;
		}
		return this.history[this.currentIndex].getDescription();
	}

	/**
	 * Get the description of the last command that can be redone
	 */
	getRedoDescription(): string | null {
		if (!this.canRedo()) {
			return null;
		}
		return this.history[this.currentIndex + 1].getDescription();
	}

	/**
	 * Get the complete history
	 */
	getHistory(): Command[] {
		return [...this.history];
	}

	/**
	 * Get the current index in history
	 */
	getCurrentIndex(): number {
		return this.currentIndex;
	}

	/**
	 * Clear all history
	 */
	clear(): void {
		this.history = [];
		this.currentIndex = -1;
		this.notifyListeners();
	}

	/**
	 * Subscribe to history state changes
	 */
	subscribe(listener: (state: HistoryState) => void): () => void {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	}

	/**
	 * Notify all listeners of state change
	 */
	private notifyListeners(): void {
		const state: HistoryState = {
			canUndo: this.canUndo(),
			canRedo: this.canRedo(),
			undoDescription: this.getUndoDescription(),
			redoDescription: this.getRedoDescription(),
			historySize: this.history.length,
			currentIndex: this.currentIndex,
		};

		this.listeners.forEach((listener) => listener(state));
	}
}

/**
 * State information about the command history
 */
export interface HistoryState {
	canUndo: boolean;
	canRedo: boolean;
	undoDescription: string | null;
	redoDescription: string | null;
	historySize: number;
	currentIndex: number;
}
