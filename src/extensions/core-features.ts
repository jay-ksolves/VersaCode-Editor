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
        console.log("Activating VersaCode Core Features...");

        // In a real implementation, the callbacks would be more complex
        // and would likely call methods on a more abstract `ide` API
        // rather than being deeply coupled to the IdeLayout component.
        // For now, these are placeholder implementations.
        
        context.registerCommand('file:new', () => {
            // This command is handled by a ref in IdeLayout for now.
            // In a more robust system, this would call an API like:
            // context.ide.workspace.newFile();
            console.log("file:new command executed via extension");
        });
        
        context.registerCommand('theme:toggle', () => {
             // This command is handled by a function in IdeLayout for now.
             console.log("theme:toggle command executed via extension");
        });
    },

    deactivate: () => {
        console.log("Deactivating VersaCode Core Features.");
    }
};
