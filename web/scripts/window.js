/**
 * window.js - Handles window layout and editor initialization
 */

// Add this to window.js or functions.js where you initialize your editors
window.templateEditor = null; // This will be set to your editor instance when initializeds

document.addEventListener('DOMContentLoaded', function() {
    // Initialize Ace editors
    setupEditors();
    
    // Setup resizable panels
    setupResizablePanel();
    
    // Setup tabs
    setupTabs();
    
    // Add window resize handler
    window.addEventListener('resize', handleResize);
});

// Initialize Ace editors
function setupEditors() {
    // Template Editor
    window.templateEditor = ace.edit("template-editor");
    templateEditor.setTheme("ace/theme/clouds_midnight");
    templateEditor.session.setMode("ace/mode/html");
    
    // Set default template content
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
    
    templateEditor.setValue(defaultTemplate, -1);
    
    // Data Editor
    window.dataEditor = ace.edit("data-editor");
    dataEditor.setTheme("ace/theme/clouds_midnight");
    dataEditor.session.setMode("ace/mode/json");
    
    // Set default JSON content
    const defaultJson = `{
    "title": "My Album Title",
    "artist_name": "Artist Name"
}`;
    
    dataEditor.setValue(defaultJson, -1);
    
    // Set editor options
    [templateEditor, dataEditor].forEach(editor => {
        editor.setShowPrintMargin(false);
        editor.setOptions({
            fontSize: "14px",
            wrap: true
        });
    });
}

// Setup resizable panels
function setupResizablePanel() {
    const divider = document.getElementById('left-divider');
    const templateSection = document.getElementById('template-section');
    const dataSection = document.getElementById('data-section');
    
    let startY, startTopHeight;
    
    divider.addEventListener('mousedown', function(e) {
        e.preventDefault();
        startY = e.clientY;
        startTopHeight = templateSection.offsetHeight;
        
        document.addEventListener('mousemove', resize);
        document.addEventListener('mouseup', stopResize);
    });
    
    function resize(e) {
        // Calculate new height
        const newHeight = startTopHeight + (e.clientY - startY);
        const totalHeight = templateSection.parentElement.offsetHeight;
        
        // Ensure minimum heights (10% of parent)
        const minHeight = totalHeight * 0.1;
        
        if (newHeight < minHeight || newHeight > totalHeight - minHeight) {
            return;
        }
        
        // Set new heights
        templateSection.style.flex = '0 0 ' + newHeight + 'px';
        dataSection.style.flex = '1 1 auto';
        
        // Resize editors
        if (window.templateEditor) window.templateEditor.resize();
        if (window.dataEditor) window.dataEditor.resize();
        
        // Update preview
        if (window.previewFunctions && window.previewFunctions.resizePreview) {
            window.previewFunctions.resizePreview();
        }
    }
    
    function stopResize() {
        document.removeEventListener('mousemove', resize);
        document.removeEventListener('mouseup', stopResize);
    }
}

// Setup tabs
function setupTabs() {
    const tabs = document.querySelectorAll('.tab');
    if (!tabs.length) return;
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            if (!tabId) return;
            
            // Remove active class from all tabs and content
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            // Add active class to selected tab and content
            this.classList.add('active');
            const contentElement = document.getElementById(tabId + '-tab');
            if (contentElement) contentElement.classList.add('active');
        });
    });
}

// Handle window resize
function handleResize() {
    // Resize editors
    if (window.templateEditor) window.templateEditor.resize();
    if (window.dataEditor) window.dataEditor.resize();
    
    // Update preview scaling
    if (window.previewFunctions && window.previewFunctions.resizePreview) {
        window.previewFunctions.resizePreview();
    }
}

// Export functions for other scripts
window.windowFunctions = {
    resizeEditors: function() {
        if (window.templateEditor) window.templateEditor.resize();
        if (window.dataEditor) window.dataEditor.resize();
    }
};