
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

        const disposables = [
            context.registerCommand({
                id: 'file:new',
                label: 'New File',
                context: 'palette',
                callback: () => context.ide.createFile(),
            }),
            context.registerCommand({
                id: 'theme:toggle',
                label: 'Toggle Theme',
                context: 'palette',
                callback: () => context.ide.toggleTheme(),
            }),
            context.registerCommand({
                id: 'tab:close',
                label: 'Close',
                context: 'editor/tab/context',
                callback: ({ fileId }) => context.ide.closeFile(fileId),
            }),
             context.registerCommand({
                id: 'tab:close-others',
                label: 'Close Others',
                context: 'editor/tab/context',
                callback: ({ fileId }) => context.ide.closeOtherFiles(fileId),
            }),
            context.registerCommand({
                id: 'tab:close-all',
                label: 'Close All',
                context: 'editor/tab/context',
                callback: () => context.ide.closeAllFiles(),
            }),
             context.registerCommand({
                id: 'separator',
                label: '',
                context: 'editor/tab/context',
                callback: () => {},
            }),
             context.registerCommand({
                id: 'tab:copy-path',
                label: 'Copy Path',
                context: 'editor/tab/context',
                callback: ({ fileId }) => {
                    // In a real app, we'd use the fileId to get the path
                    // from the file system state and copy it to the clipboard.
                    console.log('Copying path for file:', fileId);
                },
            }),
        ];

        return {
            dispose: () => {
                disposables.forEach(d => d.dispose());
            }
        };
    },

    deactivate: () => {
        console.log("Deactivating VersaCode Core Features.");
    }
};
