/**
 * preview.js - Handles isolated preview functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    // Create the isolated preview iframe
    createPreviewFrame();
    
    // Set up editor change event listeners
    setupEditorListeners();
});

function createPreviewFrame() {
    const previewContainer = document.querySelector('#preview-section .section-content');
    if (!previewContainer) return;
    
    const iframe = document.createElement('iframe');
    iframe.id = 'preview-frame';
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.style.backgroundColor = '#ffffff';
    
    // Sandbox to isolate from the main UI
    iframe.setAttribute('sandbox', 'allow-same-origin');
    
    previewContainer.appendChild(iframe);
}

function setupEditorListeners() {
    const checkEditorsInterval = setInterval(function() {
        const templateEditor = window.templateEditor;
        const dataEditor = window.dataEditor;
        
        if (templateEditor && dataEditor) {
            clearInterval(checkEditorsInterval);
            
            // Add template editor change listener
            templateEditor.session.on('change', function() {
                // Sync variables to JSON data editor
                syncVariablesToJson(templateEditor, dataEditor);
                
                // Update preview
                updatePreview(templateEditor, dataEditor);
            });
            
            // Add data editor change listener
            dataEditor.session.on('change', function() {
                updatePreview(templateEditor, dataEditor);
            });
            
            // Initial updates
            syncVariablesToJson(templateEditor, dataEditor);
            updatePreview(templateEditor, dataEditor);
        }
    }, 100);
}

function updatePreview(templateEditor, dataEditor) {
    const templateContent = templateEditor.getValue();
    let jsonData = {};
    
    try {
        jsonData = JSON.parse(dataEditor.getValue());
    } catch (e) {
        console.error('[PREVIEW] JSON parse error:', e);
    }
    
    // Process the template by replacing placeholders
    let processedTemplate = processTemplate(templateContent, jsonData);
    
    // Update the iframe content
    updateIframeContent(processedTemplate);
    
    // Update preview scaling
    updatePreviewScaling(templateContent);
}

function processTemplate(templateContent, jsonData) {
    let processedTemplate = templateContent;
    
    // Replace all variable placeholders
    for (const key in jsonData) {
        if (Object.hasOwnProperty.call(jsonData, key)) {
            const value = jsonData[key];
            // Match variables even inside CSS blocks (improved regex)
            const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
            processedTemplate = processedTemplate.replace(regex, value);
        }
    }
    
    return processedTemplate;
}

function updateIframeContent(htmlContent) {
    const iframe = document.getElementById('preview-frame');
    if (!iframe) return;
    
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    
    iframeDoc.open();
    iframeDoc.write(htmlContent);
    iframeDoc.close();
}

function updatePreviewScaling(templateContent) {
    // Find dimensions in the template
    const widthMatch = templateContent.match(/\.cover\s*{[^}]*width:\s*(\d+)px/);
    const heightMatch = templateContent.match(/\.cover\s*{[^}]*height:\s*(\d+)px/);
    
    if (widthMatch && heightMatch) {
        const width = parseInt(widthMatch[1]);
        const height = parseInt(heightMatch[1]);
        scalePreview(width, height);
        
        // Update dimension inputs if they exist
        const widthInput = document.getElementById('width');
        const heightInput = document.getElementById('height');
        
        if (widthInput) widthInput.value = width;
        if (heightInput) heightInput.value = height;
    }
}

function scalePreview(width, height) {
    const iframe = document.getElementById('preview-frame');
    const container = document.querySelector('#preview-section .section-content');
    
    if (!iframe || !container) return;
    
    // Get container dimensions
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    // Calculate scale to fit the container
    const scaleX = containerWidth / width;
    const scaleY = containerHeight / height;
    const scale = Math.min(scaleX, scaleY, 1); // Don't scale up if container is larger
    
    // Set iframe dimensions to match the template
    iframe.style.width = width + 'px';
    iframe.style.height = height + 'px';
    
    // Apply scaling
    iframe.style.position = 'absolute';
    iframe.style.transformOrigin = 'top left';
    iframe.style.transform = `scale(${scale})`;
    
    // Center the preview
    const scaledWidth = width * scale;
    const scaledHeight = height * scale;
    
    iframe.style.left = ((containerWidth - scaledWidth) / 2) + 'px';
    iframe.style.top = ((containerHeight - scaledHeight) / 2) + 'px';
}

// Sync variables from template to JSON editor
function syncVariablesToJson(templateEditor, dataEditor) {
    const templateContent = templateEditor.getValue();
    let jsonData = {};
    
    // Try to parse current JSON data
    try {
        jsonData = JSON.parse(dataEditor.getValue());
    } catch (e) {
        console.error('[PREVIEW] JSON parse error during sync:', e);
        jsonData = {};
    }
    
    // Find all placeholders in the template including inside CSS blocks
    const placeholderRegex = /{{\s*([\w_]+)\s*}}/g;
    const placeholders = new Set();
    let match;
    
    while ((match = placeholderRegex.exec(templateContent)) !== null) {
        placeholders.add(match[1]);
    }
    
    // Update JSON data with found placeholders
    let jsonChanged = false;
    
    // Add new placeholders with existing values or empty string
    placeholders.forEach(placeholder => {
        if (!(placeholder in jsonData)) {
            jsonData[placeholder] = "";
            jsonChanged = true;
        }
    });
    
    // Keep existing keys that are in the current template
    const updatedJsonData = {};
    placeholders.forEach(placeholder => {
        updatedJsonData[placeholder] = jsonData[placeholder] || "";
    });
    
    // Update JSON editor if changes were made
    if (jsonChanged) {
        const currentCursor = dataEditor.getCursorPosition();
        dataEditor.setValue(JSON.stringify(updatedJsonData, null, 4), -1);
        dataEditor.moveCursorToPosition(currentCursor);
    }
}

// Rest of the file remains the same...

// Make functions available to other scripts
window.previewFunctions = {
    updatePreview: function() {
        if (window.templateEditor && window.dataEditor) {
            updatePreview(window.templateEditor, window.dataEditor);
        }
    },
    resizePreview: function() {
        if (window.templateEditor) {
            updatePreviewScaling(window.templateEditor.getValue());
        }
    },
    syncVariablesToJson: function() {
        if (window.templateEditor && window.dataEditor) {
            syncVariablesToJson(window.templateEditor, window.dataEditor);
        }
    }
};