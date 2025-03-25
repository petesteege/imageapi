/**
 * functions.js - Core editor functionality
 */

// Extract canvas dimensions from template
function extractCanvasDimensions() {
    // Get HTML editor content
    const templateContent = window.templateEditor.getValue();
    
    // Regex to find width and height in CSS
    const widthMatch = templateContent.match(/\.cover\s*{[^}]*width:\s*(\d+)px/);
    const heightMatch = templateContent.match(/\.cover\s*{[^}]*height:\s*(\d+)px/);
    
    // Get dimension inputs
    const widthInput = document.getElementById('width');
    const heightInput = document.getElementById('height');
    
    if (widthMatch && heightMatch) {
        // Update inputs with extracted dimensions
        widthInput.value = widthMatch[1];
        heightInput.value = heightMatch[1];
        
        return {
            width: parseInt(widthMatch[1]),
            height: parseInt(heightMatch[1])
        };
    }
    
    // If no dimensions found, return current input values
    return {
        width: parseInt(widthInput.value),
        height: parseInt(heightInput.value)
    };
}

function updateCanvasDimensions() {
    const widthInput = document.getElementById('width');
    const heightInput = document.getElementById('height');
    const templateContent = window.templateEditor.getValue();
    const dataEditor = window.dataEditor;
    
    // Preserve existing JSON data
    let jsonData = {};
    try {
        jsonData = JSON.parse(dataEditor.getValue());
    } catch (e) {
        console.error('[FUNCTIONS] JSON parse error:', e);
    }
    
    // Create new template content with updated dimensions
    const updatedContent = templateContent.replace(
        /\.cover\s*{[^}]*width:\s*\d+px;[^}]*height:\s*\d+px;/,
        `.cover { width: ${widthInput.value}px; height: ${heightInput.value}px;`
    );
    
    // Update template editor
    window.templateEditor.setValue(updatedContent, -1);
    
    // Trigger preview update
    if (window.previewFunctions && window.previewFunctions.updatePreview) {
        window.previewFunctions.updatePreview();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Wait for window.js to initialize the editors
    const checkEditorsInterval = setInterval(() => {
        if (window.templateEditor) {
            clearInterval(checkEditorsInterval);
            
            // Watch for changes in template editor
            window.templateEditor.session.on('change', extractCanvasDimensions);
            
            // Add event listeners to dimension inputs
            const widthInput = document.getElementById('width');
            const heightInput = document.getElementById('height');
            
            widthInput.addEventListener('change', updateCanvasDimensions);
            heightInput.addEventListener('change', updateCanvasDimensions);
            
            // Create the editorFunctions object needed by templates.js
            window.editorFunctions = {
                getTemplateEditor: function() {
                    return window.templateEditor;
                },
                getDataEditor: function() {
                    return window.dataEditor;
                },
                getTemplateContent: function() {
                    return window.templateEditor ? window.templateEditor.getValue() : '';
                },
                getDataContent: function() {
                    return window.dataEditor ? window.dataEditor.getValue() : '{}';
                }
            };
            
        }
    }, 100);
    
    // Timeout after 5 seconds to avoid infinite checking
    setTimeout(() => {
        clearInterval(checkEditorsInterval);
        if (!window.templateEditor) {
            console.error("[FUNCTIONS] Editors were not initialized by window.js");
        }
    }, 5000);
});

// Export functions to global preview functions
if (window.previewFunctions) {
    window.previewFunctions.extractCanvasDimensions = extractCanvasDimensions;
    window.previewFunctions.updateCanvasDimensions = updateCanvasDimensions;
}