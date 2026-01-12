
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
});
