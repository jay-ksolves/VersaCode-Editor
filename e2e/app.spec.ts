
import { test, expect } from '@playwright/test';

test.describe('VersaCode IDE', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test to ensure a clean state
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/editor');
    // Wait for the file system to be fully loaded by checking for the welcome file
    await expect(page.getByTestId('file-explorer-node-welcome.md')).toBeVisible();
  });

  test('should load the editor with default layout and welcome file', async ({ page }) => {
    // Check that the "Explorer" heading in the file explorer is visible
    await expect(page.getByRole('heading', { name: 'Explorer' })).toBeVisible();
    
    // Check that the default welcome file is visible in the editor tabs and it is active
    await expect(page.getByTestId('editor-tab-welcome.md')).toBeVisible();
    await expect(page.getByTestId('editor-tab-welcome.md')).toHaveClass(/bg-background/);
  });
  
  test('should create, rename, and delete a file', async ({ page }) => {
    const newFileName = 'test-file.ts';
    const renamedFileName = 'renamed-file.ts';

    // Create a new file
    await page.getByTestId('file-explorer-new-file-button').click();
    await page.getByTestId('file-explorer-edit-input').fill(newFileName);
    await page.getByTestId('file-explorer-edit-input').press('Enter');

    // Verify the new file is created and opened
    await expect(page.getByTestId(`file-explorer-node-${newFileName}`)).toBeVisible();
    await expect(page.getByTestId(`editor-tab-${newFileName}`)).toBeVisible();

    // Rename the file
    await page.getByTestId(`file-explorer-node-${newFileName}`).hover();
    await page.getByTestId(`file-explorer-node-actions-${newFileName}`).click();
    await page.getByTestId(`file-explorer-node-rename-${newFileName}`).click();
    await page.getByTestId('file-explorer-edit-input').fill(renamedFileName);
    await page.getByTestId('file-explorer-edit-input').press('Enter');
    
    // Verify file was renamed
    await expect(page.getByTestId(`file-explorer-node-${renamedFileName}`)).toBeVisible();
    
    // Delete the file
    await page.getByTestId(`file-explorer-node-${renamedFileName}`).hover();
    await page.getByTestId(`file-explorer-node-actions-${renamedFileName}`).click();
    await page.getByTestId(`file-explorer-node-delete-${renamedFileName}`).click();
    
    // Confirm deletion in the dialog
    await expect(page.getByTestId('delete-confirmation-dialog')).toBeVisible();
    await page.getByTestId('delete-confirmation-delete-button').click();
    
    // Verify the file is gone
    await expect(page.getByTestId(`file-explorer-node-${renamedFileName}`)).not.toBeVisible();
  });

  test('should edit a file, see changes in source control, stage, and commit', async ({ page }) => {
    // Open welcome file
    await page.getByTestId('file-explorer-node-welcome.md').click();
    
    // Edit the file to create a change
    await page.locator('.monaco-editor').first().click();
    await page.keyboard.press('End');
    await page.keyboard.press('Enter');
    await page.keyboard.type('// A new comment');

    // Go to source control panel
    await page.getByTestId('activity-bar-source-control-button').click();
    await expect(page.getByTestId('source-control-panel')).toBeVisible();
    
    // Verify the file is in "Changes"
    await expect(page.getByTestId('source-control-changes-content')).toBeVisible();
    await expect(page.getByTestId('source-control-item-welcome.md')).toBeVisible();

    // Stage the file
    await page.getByTestId('source-control-item-welcome.md').hover();
    await page.getByTestId('source-control-action-welcome.md').click();

    // Verify the file is in "Staged Changes"
    await expect(page.getByTestId('source-control-staged-changes-content')).toBeVisible();
    await expect(page.getByTestId('source-control-item-welcome.md')).toBeVisible();
    
    // Add a commit message and commit
    await page.getByTestId('source-control-commit-message-input').fill('Test commit');
    await page.getByTestId('source-control-commit-button').click();

    // Verify the panel is now clean
    await expect(page.getByTestId('source-control-staged-changes-content')).not.toBeVisible();
    await expect(page.getByTestId('source-control-changes-content')).not.toBeVisible();
  });

  test('should run a command in the terminal', async ({ page }) => {
    // Open terminal
    await page.getByTestId('bottom-panel-terminal-tab').click();
    const terminalId = await page.locator('[data-testid^="terminal-session-tab-"]').first().getAttribute('data-testid');
    const sessionId = terminalId?.replace('terminal-session-tab-', '');
    
    // Type a command
    const terminalInput = page.getByTestId(`terminal-input-${sessionId}`);
    await terminalInput.type('1 + 1');
    await terminalInput.press('Enter');
    
    // Check for the output
    const terminalOutput = page.getByTestId(`terminal-output-${sessionId}`);
    await expect(terminalOutput).toContainText('<- 2');
  });

  test('should interact with the AI assistant panel and get a mocked response', async ({ page }) => {
    // Mock the AI response
    await page.route('**/ai/flows/ai-assistant-flow.ts', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ generatedCode: 'const x = "mocked response";' }),
      });
    });

    // Open AI assistant
    await page.getByTestId('activity-bar-ai-assistant-button').click();
    await expect(page.getByTestId('ai-assistant-panel')).toBeVisible();
    
    // Enter API key and prompt
    await page.getByTestId('ai-assistant-api-key-input').fill('test-api-key');
    await page.getByTestId('ai-assistant-save-api-key-button').click();
    
    await page.getByTestId('ai-assistant-prompt-textarea').fill('This is a test prompt');
    await page.getByTestId('ai-assistant-generate-button').click();

    // Verify the mocked response is displayed in the readonly editor
    await expect(page.getByTestId('ai-assistant-response-container')).toBeVisible();
    const responseEditor = page.locator('[data-testid="ai-assistant-response-container"] .monaco-editor').first();
    await expect(responseEditor).toContainText('mocked response');
  });

  test('should toggle theme and persist it on reload', async ({ page }) => {
    // Check initial theme is dark
    await expect(page.locator('html')).toHaveClass('dark');

    // Toggle to light theme
    await page.getByTestId('header-theme-toggle-button').click();
    await expect(page.locator('html')).not.toHaveClass('dark');

    // Reload the page
    await page.reload();
    await expect(page.getByTestId('file-explorer-node-welcome.md')).toBeVisible();

    // Verify theme is still light
    await expect(page.locator('html')).not.toHaveClass('dark');
  });

  test('should use Command Palette to create a new file', async ({ page }) => {
    // Open Command Palette
    await page.getByTestId('header-command-palette-button').click();
    await expect(page.getByRole('dialog', { name: 'Command Palette' })).toBeVisible();

    // Select "New File"
    await page.getByRole('option', { name: 'New File' }).click();

    // The input for the new file should appear in the explorer
    await expect(page.getByTestId('file-explorer-edit-input')).toBeVisible();
    await page.getByTestId('file-explorer-edit-input').fill('file-from-palette.js');
    await page.getByTestId('file-explorer-edit-input').press('Enter');

    // Verify the new file exists
    await expect(page.getByTestId('file-explorer-node-file-from-palette.js')).toBeVisible();
  });

  test('should handle multi-step undo/redo in the editor', async ({ page }) => {
    await page.getByTestId('file-explorer-node-welcome.md').click();
    const editor = page.locator('.monaco-editor').first();

    // Perform two edits
    await editor.click();
    await page.keyboard.press('End');
    await page.keyboard.type('\nFirst edit.');
    await page.keyboard.type('\nSecond edit.');

    // Verify both edits are present
    await expect(editor).toContainText('First edit.');
    await expect(editor).toContainText('Second edit.');

    // Undo the second edit
    await page.keyboard.press('Control+Z');
    await expect(editor).not.toContainText('Second edit.');
    await expect(editor).toContainText('First edit.');

    // Undo the first edit
    await page.keyboard.press('Control+Z');
    await expect(editor).not.toContainText('First edit.');

    // Redo the first edit
    await page.keyboard.press('Control+Y');
    await expect(editor).toContainText('First edit.');
    
    // Redo the second edit
    await page.keyboard.press('Control+Y');
    await expect(editor).toContainText('Second edit.');
  });
});
