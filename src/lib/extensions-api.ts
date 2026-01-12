/**
 * @fileoverview Defines the core API for creating VersaCode extensions.
 */

import { IdeLayout } from "@/components/versacode/ide-layout";

/**
 * Represents the core API surface that is passed to each extension's
 * `activate` function. This allows extensions to register commands, interact
 * with the UI, and contribute functionality to the IDE.
 */
export interface ExtensionContext {
    /**
     * Registers a command that can be executed by the user via the command
     * palette or keybindings.
     * @param commandId A unique identifier for the command (e.g., 'extension.sayHello').
     * @param callback The function to execute when the command is triggered.
     * @returns A disposable object that can be used to unregister the command.
     */
    registerCommand: (commandId: string, callback: (...args: any[]) => any) => { dispose: () => void };

    /**
     * A reference to the root IDE layout component.
     * Note: Direct manipulation is discouraged. This is provided for advanced
     * scenarios and accessing core IDE state.
     */
    // TODO: Expose a more limited and stable API instead of the full component instance.
    ide: IdeLayout | null;
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
     */
    activate: (context: ExtensionContext) => void;

    /**
     * A method that is called when the extension is deactivated.
     * This is used for cleanup, such as disposing of registered commands.
     */
    deactivate?: () => void;
}
