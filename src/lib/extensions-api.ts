
/**
 * @fileoverview Defines the core API for creating VersaCode extensions.
 */

export interface IdeAPI {
    getActiveFile: () => { path: string; id: string; content: string } | null;
    closeFile: (id: string) => void;
    closeAllFiles: () => void;
    closeOtherFiles: (id: string) => void;
    getOpenFileIds: () => string[];
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    createFile: () => void;
}


/**
 * Represents the core API surface that is passed to each extension's
 * `activate` function. This allows extensions to register commands, interact
 * with the UI, and contribute functionality to the IDE.
 */
export interface ExtensionContext {
    /**
     * Registers a command that can be executed by the user.
     * @param command The command object to register.
     * @returns A disposable object that can be used to unregister the command.
     */
    registerCommand: (command: IdeCommand) => { dispose: () => void };

    /**
     * Provides access to a limited, stable set of IDE functionalities.
     */
    readonly ide: IdeAPI;
}

/**
 * Defines a command that can be executed in the IDE.
 */
export interface IdeCommand {
    /** A unique identifier for the command (e.g., 'file:new'). */
    id: string;
    /** The user-facing label for the command. */
    label: string;
    /** The function to execute when the command is triggered. It receives an optional context object. */
    callback: (context?: any) => any;
    /** An optional UI context for where this command should appear (e.g., in a specific context menu). */
    context?: string;
    /** An optional icon to display with the command. */
    icon?: React.ComponentType<{ className?: string }>;
}


/**
 * The interface that every VersaCode extension must implement.
 */
export interface VersaCodeExtension {
    /**
     * A unique identifier for the extension, typically in 'publisher.name' format.
     */
    id: string;

    /**
     * The human-readable name of the extension.
     */
    name: string;

    /**
     * A brief description of what the extension does.
     */
    description: string;

    /**
     * The publisher of the extension.
     */
    publisher: string;
    
    /**
     * The version of the extension.
     */
    version: string;

    /**
     * A method that is called when the extension is activated.
     * This happens once when the IDE is started.
     * @param context An object providing APIs for the extension to interact with the IDE.
     * @returns A disposable object for cleanup, or void.
     */
    activate: (context: ExtensionContext) => { dispose: () => void } | void;

    /**
     * A method that is called when the extension is deactivated.
     * This is used for cleanup, such as disposing of registered commands.
     */
    deactivate?: () => void;
}
