/**
 * api.js - Handles API communication
 * All template functionality has been moved to templates.js
 * All image functionality has been moved to images.js
 */

// Initialize when the document is ready
document.addEventListener('DOMContentLoaded', function() {
    // Setup API-related event listeners
    setupAPIEventListeners();
    
    // Log API connection info
    logServerInfo();
});

// Function to determine server URL based on environment variables
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

// Setup all event listeners related to API functionality
function setupAPIEventListeners() {
    // Download Image button (now delegates to images.js)
    document.getElementById('download-image').addEventListener('click', window.imageFunctions.downloadImage);
}

// Logging function for API operations
function logMessage(message) {
    const logOutput = document.getElementById('log-output');
    if (logOutput) {
        const timestamp = new Date().toLocaleTimeString();
        logOutput.value += `[${timestamp}] ${message}\n`;
        logOutput.scrollTop = logOutput.scrollHeight; // Scroll to bottom
    }
}

// Log server connection information
function logServerInfo() {
    const serverUrl = getServerUrl();
    const apiKey = getAPIKey();
    
    logMessage(`[NET] Server URL: ${serverUrl}`);
    logMessage(`[NET] API Key: ${apiKey ? '********' : 'Not set'}`);
}

// Export API functions for use in other modules
window.api = {
    getServerUrl,
    getAPIKey,
    logMessage
};