/**
 * Handles syncing the description textarea with the meta description tag in the template
 */

// Flag to prevent circular updates
let isUpdatingFromTemplate = false;

// Set up the description field watcher
function setupDescriptionWatcher() {
    const descriptionField = document.getElementById('template-description');
    if (!descriptionField) {
        logMessage("[ERROR] Description field not found");
        return;
    }

    // Watch for input events on the description field
    descriptionField.addEventListener('input', function() {
        if (isUpdatingFromTemplate) return; // Skip if update is from template loading
        updateTemplateDescription(this.value);
    });
}

// Update the template's meta description tag
function updateTemplateDescription(description) {
    const templateEditor = window.editorFunctions.getTemplateEditor();
    if (!templateEditor) {
        logMessage("[ERROR] Template editor not initialized");
        return;
    }

    let templateContent = templateEditor.getValue();
    
    // Check if a meta description already exists
    const descriptionRegex = /<meta\s+name=["']description["']\s+content=["']([^"']*)["']\s*\/?>/i;
    
    if (descriptionRegex.test(templateContent)) {
        // Update existing meta description
        templateContent = templateContent.replace(
            descriptionRegex, 
            `<meta name="description" content="${escapeHtml(description)}" />`
        );
    } else {
        // Add new meta description after the charset meta tag
        const charsetRegex = /<meta\s+charset=["']UTF-8["']\s*\/?>/i;
        
        if (charsetRegex.test(templateContent)) {
            templateContent = templateContent.replace(
                charsetRegex,
                `<meta charset="UTF-8" />\n    <meta name="description" content="${escapeHtml(description)}" />`
            );
        } else {
            // If no charset meta, try to add after head tag
            const headRegex = /<head>/i;
            if (headRegex.test(templateContent)) {
                templateContent = templateContent.replace(
                    headRegex,
                    `<head>\n    <meta name="description" content="${escapeHtml(description)}" />`
                );
            } else {
                logMessage("[ERROR] Could not find appropriate location to add meta description");
                return;
            }
        }
    }

    // Update editor content
    templateEditor.setValue(templateContent, -1);
    // Maintain cursor position if needed
    logMessage("[TEMPLATE] Updated meta description");
}

// Extract description from template when loaded
function extractDescriptionFromTemplate(templateContent) {
    isUpdatingFromTemplate = true;
    
    try {
        const descriptionField = document.getElementById('template-description');
        if (!descriptionField) return;
        
        // Extract description from meta tag
        const descriptionRegex = /<meta\s+name=["']description["']\s+content=["']([^"']*)["']\s*\/?>/i;
        const match = templateContent.match(descriptionRegex);
        
        if (match && match[1]) {
            // Update the description field
            descriptionField.value = match[1];
            logMessage("[TEMPLATE] Found and loaded description from template");
        } else {
            // Clear the description field if no description found
            descriptionField.value = '';
        }
    } catch (error) {
        logMessage(`[ERROR] Failed to extract description: ${error.message}`);
    } finally {
        // Reset flag after a short delay to allow other processes to complete
        setTimeout(() => {
            isUpdatingFromTemplate = false;
        }, 300);
    }
}

// Escape HTML special characters
function escapeHtml(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Watch for changes in the template editor
function setupTemplateEditorWatcher() {
    const templateEditor = window.editorFunctions.getTemplateEditor();
    if (!templateEditor) {
        logMessage("[ERROR] Template editor not initialized");
        return;
    }

    // Add change event listener to the editor
    templateEditor.getSession().on('change', function() {
        // Only process if we're not already updating from the description field
        if (isUpdatingFromTemplate) return;

        // Get current content and extract description
        const content = templateEditor.getValue();
        const descriptionRegex = /<meta\s+name=["']description["']\s+content=["']([^"']*)["']\s*\/?>/i;
        const match = content.match(descriptionRegex);
        
        if (match && match[1]) {
            // Update description field without triggering the circular update
            const descriptionField = document.getElementById('template-description');
            if (descriptionField && descriptionField.value !== match[1]) {
                isUpdatingFromTemplate = true;
                descriptionField.value = match[1];
                setTimeout(() => {
                    isUpdatingFromTemplate = false;
                }, 300);
            }
        }
    });
}

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', function() {
    setupDescriptionWatcher();
    
    // Wait a moment to ensure editors are initialized
    setTimeout(function() {
        if (!window.editorFunctions || !window.editorFunctions.getTemplateEditor) {
            logMessage("[ERROR] Editor functions not found. Make sure functions.js is loaded correctly.");
        } else {
            setupTemplateEditorWatcher();
        }
    }, 500);
});