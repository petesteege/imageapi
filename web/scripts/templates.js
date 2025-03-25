/**
 * templates.js - Consolidated template management functionality
 * Handles loading, saving, and managing templates
 */

// Initialize when the document is ready
document.addEventListener('DOMContentLoaded', function() {
    // Setup template-related event listeners
    setupTemplateEventListeners();
    
    // Load templates list
    loadTemplatesList();
    
    // Wait a moment to ensure editors are initialized
    setTimeout(function() {
        // Check if editors are available
        if (!window.editorFunctions || !window.editorFunctions.getTemplateEditor) {
            logMessage("[ERROR] Editor functions not found. Make sure functions.js is loaded correctly.");
        }
    }, 500);
});

// Get server URL based on configuration
function getServerUrl() {
    const PROTC = window.config.PROTOCOL || 'http';
    const SERVER_NAME_API = window.config.SERVER_NAME_API || 'localhost';
    const API_PORT = window.config.API_PORT || '8000';
    const USE_PROXY = window.config.USE_PROXY === 'true' || window.config.USE_PROXY === true;
    
    let url;
    if (USE_PROXY) {
        url = `${PROTC}://${SERVER_NAME_API}`;
        logMessage("[NET] Using proxy mask");
    } else {
        url = `${PROTC}://${SERVER_NAME_API}:${API_PORT}`;
        logMessage("[NET] Using direct server address & port");
    }
    
    return url;
}

// Get API key from environment
function getAPIKey() {
    return window.config.API_KEY || '';
}

// Setup all template-related event listeners
function setupTemplateEventListeners() {
    // Create New Template button
    document.getElementById('create-new-template').addEventListener('click', createNewTemplate);
    
    // Save Template button
    document.getElementById('save-template').addEventListener('click', saveTemplate);
    
    // Load Template button
    document.getElementById('load-template').addEventListener('click', loadSelectedTemplate);
    
    // Delete Selected Template button
    document.getElementById('delete-template').addEventListener('click', deleteSelectedTemplate);
    
    // Download Template button
    document.getElementById('download-template').addEventListener('click', downloadSelectedTemplate);
    
    // Upload Template button
    document.getElementById('upload-template').addEventListener('click', uploadTemplate);
    
    // Tab click to refresh templates list
    document.querySelector('.tab[data-tab="templates"]').addEventListener('click', loadTemplatesList);
}

// Create a new template with default content
function createNewTemplate() {
    const templateEditor = window.editorFunctions.getTemplateEditor();
    const dataEditor = window.editorFunctions.getDataEditor();
    
    if (!templateEditor || !dataEditor) {
        logMessage("[ERROR] Editors not initialized");
        return;
    }
    
    // Default template HTML
    const defaultTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>{{title}}</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
        }
        .cover {
            width: 800px;
            height: 800px;
            position: relative;
            background-color: #f0f0f0;
        }
        .title {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 36px;
            color: #333;
            text-align: center;
        }
        .artist {
            position: absolute;
            bottom: 100px;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 24px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="cover">
        <div class="title">{{title}}</div>
        <div class="artist">{{artist_name}}</div>
    </div>
</body>
</html>`;
    
    // Default JSON data
    const defaultJson = `{
    "title": "My Album Title",
    "artist_name": "Artist Name"
}`;
    
    // Set values in editors
    templateEditor.setValue(defaultTemplate, -1);
    dataEditor.setValue(defaultJson, -1);
    
    // Set a default name in the template name field
    document.getElementById('template-name').value = 'new_template.html';
    
    logMessage("[TEMPLATE] Created new template");
}

// Save the current template
function saveTemplate() {
    const templateEditor = window.editorFunctions.getTemplateEditor();
    if (!templateEditor) {
        logMessage("[ERROR] Template editor not initialized");
        return;
    }
    
    let templateName = document.getElementById('template-name').value.trim();
    const templateContent = templateEditor.getValue();
    
    // Validate input
    if (!templateName) {
        alert("Please provide a template name");
        return;
    }
    
    // Ensure template name has .html extension
    if (!templateName.endsWith('.html')) {
        templateName += '.html';
    }
    
    // Prepare form data for submission
    const formData = new FormData();
    formData.append('template_name', templateName);
    formData.append('template_content', templateContent);
    
    // Send the request to save the template
    fetch(`${getServerUrl()}/api/save_template`, {
        method: 'POST',
        headers: {
            'X-API-Key': getAPIKey()
        },
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            alert('Template saved successfully');
            logMessage(`[TEMPLATE] Saved template: ${templateName}`);
            
            // Refresh the templates list
            loadTemplatesList();
        } else {
            alert(`Error saving template: ${data.message}`);
            logMessage(`[ERROR] Failed to save template: ${data.message}`);
        }
    })
    .catch(error => {
        alert(`Error saving template: ${error.message}`);
        logMessage(`[ERROR] Save template exception: ${error.message}`);
    });
}

// Load a template from the server
function loadTemplate(templateName) {
    fetch(`${getServerUrl()}/api/download_template/${templateName}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load template: ${response.statusText}`);
            }
            return response.text();
        })
        .then(templateContent => {
            // Check if window.editorFunctions exists
            if (!window.editorFunctions || !window.editorFunctions.getTemplateEditor) {
                throw new Error("Editor functions not available. Make sure functions.js is properly loaded.");
            }
            
            const templateEditor = window.editorFunctions.getTemplateEditor();
            if (!templateEditor) {
                throw new Error("Template editor not initialized");
            }
            
            templateEditor.setValue(templateContent, -1);
            document.getElementById('template-name').value = templateName;
            
            // Extract and set description from template
            extractDescriptionFromTemplate(templateContent);
            
            // Update JSON editor with placeholders from template
            updateJSONFromTemplate(templateContent);
            
            // Switch to the create tab
            const createTab = document.querySelector('.tab[data-tab="create"]');
            activateTab(createTab);
            
            logMessage(`[TEMPLATE] Loaded template: ${templateName}`);
        })
        .catch(error => {
            logMessage(`[ERROR] Failed to load template: ${error.message}`);
            alert(`Error loading template: ${error.message}`);
        });
}

// Helper function to activate a tab
function activateTab(tabElement) {
    // First, remove active class from all tabs and tab contents
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // Add active class to the selected tab
    tabElement.classList.add('active');
    
    // Activate the corresponding tab content
    const tabId = tabElement.getAttribute('data-tab');
    document.getElementById(`${tabId}-tab`).classList.add('active');
}

// Extract placeholders from template and update JSON editor
function updateJSONFromTemplate(templateContent) {
    const dataEditor = window.editorFunctions.getDataEditor();
    if (!dataEditor) return;
    
    try {
        // Get current JSON data
        let jsonData = {};
        try {
            jsonData = JSON.parse(dataEditor.getValue());
        } catch (e) {
            jsonData = {};
        }
        
        // Find all placeholders in the format {{variable_name}}
        const placeholderRegex = /{{\s*([\w_]+)\s*}}/g;
        const placeholders = new Set();
        let match;
        
        while ((match = placeholderRegex.exec(templateContent)) !== null) {
            placeholders.add(match[1]);
        }
        
        // Add found placeholders to JSON data if they don't exist
        let jsonChanged = false;
        
        placeholders.forEach(placeholder => {
            if (!(placeholder in jsonData)) {
                jsonData[placeholder] = "";
                jsonChanged = true;
            }
        });
        
        // Remove placeholders from JSON that are no longer in the template
        for (const key in jsonData) {
            if (!placeholders.has(key)) {
                delete jsonData[key];
                jsonChanged = true;
            }
        }
        
        // Update JSON editor if changes were made
        if (jsonChanged) {
            dataEditor.setValue(JSON.stringify(jsonData, null, 4), -1);
        }
    } catch (error) {
        logMessage(`[ERROR] Failed to update JSON from template: ${error.message}`);
    }
}

// Load the selected template
function loadSelectedTemplate() {
    const selectedRow = document.querySelector('#templates-list tr.selected');
    if (selectedRow) {
        const templateId = selectedRow.dataset.value;
        loadTemplate(templateId);
    } else {
        alert("Please select a template to load");
    }
}

// Handle template selection change
function onTemplateSelected() {
    // This function can be used to update UI elements based on template selection
    // Currently using the load button instead of auto-loading
}

// Delete the selected template
function deleteSelectedTemplate() {
    const selectedRow = document.querySelector('#templates-list tr.selected');
    if (!selectedRow) {
        alert("Please select a template to delete");
        return;
    }
    
    if (!confirm(`Are you sure you want to delete this template?`)) {
        return;
    }
    
    fetch(`${getServerUrl()}/api/delete_template/${selectedRow.dataset.value}`, {
        method: 'DELETE',
        headers: {
            'X-API-Key': getAPIKey()
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            logMessage(`[TEMPLATE] Deleted template`);
            loadTemplatesList();
        } else {
            const errorMsg = data.message || "Unknown error";
            alert(`Error deleting template: ${errorMsg}`);
            logMessage(`[ERROR] Failed to delete template: ${errorMsg}`);
        }
    })
    .catch(error => {
        alert(`Error: ${error.message}`);
        logMessage(`[ERROR] Delete template exception: ${error.message}`);
    });
}

// Download the selected template
function downloadSelectedTemplate() {
    const selectedRow = document.querySelector('#templates-list tr.selected');
    if (!selectedRow) {
        alert("Please select a template to download");
        return;
    }
    
    const a = document.createElement('a');
    a.href = `${getServerUrl()}/api/download_template/${selectedRow.dataset.value}`;
    a.download = selectedRow.dataset.value + '.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    logMessage(`[TEMPLATE] Downloaded template`);
}

// Upload a template file
function uploadTemplate() {
    const fileInput = document.getElementById('upload-template-file');
    
    // Create file input if it doesn't exist
    if (!fileInput) {
        const input = document.createElement('input');
        input.type = 'file';
        input.id = 'upload-template-file';
        input.accept = '.html';
        input.style.display = 'none';
        document.body.appendChild(input);
        
        input.addEventListener('change', function() {
            handleTemplateUpload(this);
        });
    }
    
    // Trigger file selection
    document.getElementById('upload-template-file').click();
}

// Handle template file upload
function handleTemplateUpload(fileInput) {
    if (!fileInput.files || fileInput.files.length === 0) {
        return;
    }
    
    const file = fileInput.files[0];
    const templateName = file.name;
    
    // Prepare form data for upload
    const formData = new FormData();
    formData.append('file', file);
    
    // Send the upload request
    fetch(`${getServerUrl()}/api/upload_template?template_id=${encodeURIComponent(templateName.replace('.html', ''))}`, {
        method: 'POST',
        headers: {
            'X-API-Key': getAPIKey()
        },
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            alert('Template uploaded successfully');
            logMessage(`[TEMPLATE] Uploaded template: ${templateName}`);
            
            // Refresh templates list
            loadTemplatesList();
        } else {
            alert(`Error uploading template: ${data.message}`);
            logMessage(`[ERROR] Failed to upload template: ${data.message}`);
        }
    })
    .catch(error => {
        alert(`Error: ${error.message}`);
        logMessage(`[ERROR] Upload template exception: ${error.message}`);
    });
    
    // Reset file input
    fileInput.value = '';
}

// Logging function for template operations
function logMessage(message) {
    const logOutput = document.getElementById('log-output');
    if (logOutput) {
        const timestamp = new Date().toLocaleTimeString();
        logOutput.value += `[${timestamp}] ${message}\n`;
        logOutput.scrollTop = logOutput.scrollHeight; // Scroll to bottom
    }
}

function loadTemplatesList() {
    const templatesContainer = document.querySelector('.templates-list-container');
    templatesContainer.innerHTML = '';
    
    // Create table with same classes as original select
    const table = document.createElement('table');
    table.id = 'templates-list';
    table.className = 'list';
    table.style.width = '100%';
    
    // Fetch templates
    fetch(`${getServerUrl()}/api/templates`)
        .then(response => response.json())
        .then(data => {
            data.templates.forEach(template => {
                // Create row
                const row = document.createElement('tr');
                
                // Store template name as data attribute (for loading)
                const templateId = template.name.replace(/\.html$/, '');
                row.dataset.value = templateId;
                
                // Create filename cell
                const nameCell = document.createElement('td');
                nameCell.textContent = template.name;
                nameCell.style.width = '70%';
                
                // Create date cell
                const dateCell = document.createElement('td');
                dateCell.textContent = template.created_at_formatted.split(' ')[0];
                dateCell.style.width = '30%';
                
                // Add cells to row
                row.appendChild(nameCell);
                row.appendChild(dateCell);
                
                // Add click handler for selection
                row.addEventListener('click', function() {
                    // Update selection
                    document.querySelectorAll('#templates-list tr').forEach(r => r.classList.remove('selected'));
                    this.classList.add('selected');
                });
                
                // Add row to table
                table.appendChild(row);
            });
            
            // Add selection styling
            const style = document.createElement('style');
            style.textContent = `
                #templates-list tr {cursor: pointer;}
                #templates-list tr:hover {background-color: #444;}
                #templates-list tr.selected {background-color: #555;}
            `;
            document.head.appendChild(style);
            
            // Add to container
            templatesContainer.appendChild(table);
            
            logMessage(`[TEMPLATE] Loaded ${data.templates.length} templates`);
        })
        .catch(error => {
            logMessage(`[ERROR] Failed to load templates: ${error.message}`);
        });
}