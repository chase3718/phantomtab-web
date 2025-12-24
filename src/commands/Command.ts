/**
 * Base interface for all commands that can be executed, undone, and redone
 */
export interface Command {
	/**
	 * Execute the command
	 */
	execute(): void;

	/**
	 * Undo the command and restore previous state
	 */
	undo(): void;

	/**
	 * Get a human-readable description of this command
	 */
	getDescription(): string;
}
