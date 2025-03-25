// JSON Data Editor Handler
document.addEventListener('DOMContentLoaded', function() {
    // Get references to the data editor header
    const dataHeader = document.querySelector('#data-section .section-header');
    
    // Create the Save button
    const saveButton = document.createElement('div');
    saveButton.className = 'button';
    saveButton.textContent = 'Save';
    saveButton.id = 'save-json-data';
    
    // Create the Load button
    const loadButton = document.createElement('div');
    loadButton.className = 'button';
    loadButton.textContent = 'Load';
    loadButton.id = 'load-json-data';
    
    // Create the input element for file upload (hidden)
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.id = 'json-file-input';
    fileInput.accept = '.json';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);
    
    // Create a container for the buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'header-buttons';
    buttonContainer.appendChild(saveButton);
    buttonContainer.appendChild(loadButton);
    
    // Add the buttons to the header
    dataHeader.appendChild(buttonContainer);
    
    // Save JSON data functionality
    saveButton.addEventListener('click', function() {
        try {
            // Get the content from the data editor
            const jsonContent = dataEditor.getValue();
            
            // Try to parse it to ensure it's valid JSON
            JSON.parse(jsonContent);
            
            // Create a Blob from the JSON content
            const blob = new Blob([jsonContent], { type: 'application/json' });
            
            // Create a download link
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'api_data.json';
            
            // Append, click, and remove the link to trigger download
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            // Clean up the URL object
            URL.revokeObjectURL(url);
            
            // Log the action
            logMessage('JSON data saved successfully');
        } catch (error) {
            // Log the error
            logMessage('Error saving JSON data: ' + error.message);
            alert('Invalid JSON data. Please check the format and try again.');
        }
    });
    
    // Load JSON data functionality
    loadButton.addEventListener('click', function() {
        fileInput.click();
    });
    
    // Handle file selection
    fileInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                try {
                    const content = e.target.result;
                    
                    // Try to parse it to ensure it's valid JSON
                    JSON.parse(content);
                    
                    // Set the content in the editor
                    dataEditor.setValue(content);
                    
                    // Log the action
                    logMessage('JSON data loaded from ' + file.name);
                } catch (error) {
                    // Log the error
                    logMessage('Error loading JSON data: ' + error.message);
                    alert('Invalid JSON file. Please check the format and try again.');
                }
            };
            
            reader.onerror = function() {
                logMessage('Error reading file');
                alert('Error reading file');
            };
            
            reader.readAsText(file);
        }
        
        // Reset the file input to allow selecting the same file again
        this.value = '';
    });
});

// Helper function to log messages (using existing log functionality)
function logMessage(message) {
    // Check if the log function already exists
    if (typeof log === 'function') {
        log(message);
    } else {
        // If not, create a basic log function
        const logOutput = document.getElementById('log-output');
        if (logOutput) {
            const timestamp = new Date().toLocaleTimeString();
            logOutput.value += `[${timestamp}] ${message}\n`;
            logOutput.scrollTop = logOutput.scrollHeight;
        }
    }
}