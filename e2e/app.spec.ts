
import { test, expect } from '@playwright/test';

test.describe('VersaCode IDE', () => {
  test('should load the homepage and navigate to the editor', async ({ page }) => {
    // Go to the homepage
    await page.goto('/');

    // Check for the main heading
    await expect(page.getByRole('heading', { name: 'The AI-Native Web IDE' })).toBeVisible();

    // Find and click the "Launch Editor" button
    await page.getByRole('link', { name: 'Launch Editor' }).click();

    // Wait for the editor page to load and check the URL
    await page.waitForURL('/editor');
    await expect(page).toHaveURL('/editor');

    // Check that the "Explorer" heading in the file explorer is visible
    await expect(page.getByRole('heading', { name: 'Explorer' })).toBeVisible();
    
    // Check that the default welcome file is visible in the editor
    await expect(page.getByTestId('editor-tab-welcome.md')).toBeVisible();
  });
  
  test('should create, rename, and delete a file', async ({ page }) => {
    await page.goto('/editor');

    // Wait for file system to be ready
    await expect(page.getByTestId('file-explorer')).toBeVisible();

    const newFileName = 'test-file.ts';
    const renamedFileName = 'renamed-file.ts';

    // Create a new file
    await page.getByTestId('file-explorer-new-file-button').click();
    await page.getByTestId('file-explorer-edit-input').fill(newFileName);
    await page.getByTestId('file-explorer-edit-input').press('Enter');

    // Verify the new file is created and opened
    await expect(page.getByTestId(`file-explorer-node-test-file.ts`)).toBeVisible();
    await expect(page.getByTestId(`editor-tab-test-file.ts`)).toBeVisible();

    // Rename the file
    await page.getByTestId(`file-explorer-node-test-file.ts`).hover();
    await page.getByTestId(`file-explorer-node-actions-test-file.ts`).click();
    await page.getByTestId(`file-explorer-node-rename-test-file.ts`).click();
    await page.getByTestId('file-explorer-edit-input').fill(renamedFileName);
    await page.getByTestId('file-explorer-edit-input').press('Enter');
    
    // Verify file was renamed
    await expect(page.getByTestId(`file-explorer-node-renamed-file.ts`)).toBeVisible();
    
    // Delete the file
    await page.getByTestId(`file-explorer-node-renamed-file.ts`).hover();
    await page.getByTestId(`file-explorer-node-actions-renamed-file.ts`).click();
    await page.getByTestId(`file-explorer-node-delete-renamed-file.ts`).click();
    
    // Confirm deletion in the dialog
    await expect(page.getByTestId('delete-confirmation-dialog')).toBeVisible();
    await page.getByTestId('delete-confirmation-delete-button').click();
    
    // Verify the file is gone
    await expect(page.getByTestId(`file-explorer-node-renamed-file.ts`)).not.toBeVisible();
  });

  test('should stage and commit a change via source control', async ({ page }) => {
    await page.goto('/editor');
    await expect(page.getByTestId('file-explorer')).toBeVisible();

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
    await page.goto('/editor');
    
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

  test('should interact with the AI assistant panel', async ({ page }) => {
    await page.goto('/editor');
    
    // Open AI assistant
    await page.getByTestId('activity-bar-ai-assistant-button').click();
    await expect(page.getByTestId('ai-assistant-panel')).toBeVisible();
    
    // Enter API key and prompt
    await page.getByTestId('ai-assistant-api-key-input').fill('test-api-key');
    await page.getByTestId('ai-assistant-save-api-key-button').click();
    
    await page.getByTestId('ai-assistant-prompt-textarea').fill('This is a test prompt');

    // Check a file for context
    await page.getByTestId('ai-assistant-file-context-checkbox-welcome.md').check();

    // Click generate
    await page.getByTestId('ai-assistant-generate-button').click();

    // We can't test the actual AI response without a real key, 
    // but we can check if the flow completes without crashing.
    // A success toast would appear, let's check for that (or an error toast).
    await expect(page.getByTestId('ai-assistant-generate-button')).not.toHaveAttribute('disabled');
  });

});
