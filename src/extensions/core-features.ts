/**
 * @fileoverview Core Features Extension for VersaCode.
 * This extension registers fundamental commands that are essential for the IDE's
 * basic functionality, such as creating new files or toggling the theme.
 */

import { VersaCodeExtension, ExtensionContext } from "@/lib/extensions-api";

export const coreFeaturesExtension: VersaCodeExtension = {
    id: 'versacode.core-features',
    name: 'VersaCode Core Features',
    description: 'Provides essential IDE commands like file creation and theme toggling.',
    publisher: 'VersaCode',
    version: '1.0.0',

    activate: (context: ExtensionContext) => {
        // Here we would register commands.
        // For now, these are deeply integrated into the IdeLayout component.
        // This serves as a placeholder for future refactoring where the command
        // logic would be centralized and callable from here.
        console.log("Activating VersaCode Core Features...");

        // Example of how a command would be registered:
        // context.registerCommand('file.new', () => {
        //   context.ide?.handleNewFile();
        // });
        //
        // context.registerCommand('theme.toggle', () => {
        //   context.ide?.handleToggleTheme();
        // });
    },

    deactivate: () => {
        console.log("Deactivating VersaCode Core Features.");
    }
};
