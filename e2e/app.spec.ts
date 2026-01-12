
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
    await expect(page.getByText('welcome.md')).toBeVisible();
  });
  
  test('should create, rename, and delete a file', async ({ page }) => {
    await page.goto('/editor');

    // Wait for file system to be ready
    await expect(page.getByRole('heading', { name: 'Explorer' })).toBeVisible();

    const newFileName = 'test-file.ts';
    const renamedFileName = 'renamed-file.ts';

    // Create a new file
    await page.getByRole('button', { name: 'New File' }).click();
    await page.locator('input[type="text"]').fill(newFileName);
    await page.locator('input[type="text"]').press('Enter');

    // Verify the new file is created and opened
    await expect(page.getByText(newFileName).first()).toBeVisible();
    await expect(page.getByTitle(newFileName)).toBeVisible(); // Check editor tab

    // Rename the file
    await page.getByText(newFileName).first().hover();
    await page.getByRole('button', { name: `Actions for ${newFileName}` }).click();
    await page.getByRole('button', { name: 'Rename' }).click();
    await page.locator('input[type="text"]').fill(renamedFileName);
    await page.locator('input[type="text"]').press('Enter');
    
    // Verify file was renamed
    await expect(page.getByText(renamedFileName).first()).toBeVisible();
    
    // Delete the file
    await page.getByText(renamedFileName).first().hover();
    await page.getByRole('button', { name: `Actions for ${renamedFileName}` }).click();
    await page.getByRole('button', { name: 'Delete' }).click();
    
    // Confirm deletion in the dialog
    await expect(page.getByRole('heading', { name: 'Are you sure?' })).toBeVisible();
    await page.getByRole('button', { name: 'Delete' }).click();
    
    // Verify the file is gone
    await expect(page.getByText(renamedFileName)).not.toBeVisible();
  });
});
