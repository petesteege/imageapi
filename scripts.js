// Access environment variables defined in window.config
const SERVER_NAME_API = window.config.SERVER_NAME_API;
const API_PORT        = window.config.API_PORT;
const SERVER_NAME_GUI = window.config.SERVER_NAME_GUI;
const WEB_PORT        = window.config.WEB_PORT;
const API_KEY         = window.config.API_KEY;
const PROTC           = window.config.PROTOCOL;
const USE_PROXY       = window.config.USE_PROXY;

function serverUrl() {
    let url;

    if (USE_PROXY) {
        url = `${PROTC}://${SERVER_NAME_API}`;
        logMessage("[NET] Using proxy mask");
        
    } else {
        url = `${PROTC}://${SERVER_NAME_API}:${API_PORT}`;
        logMessage(`[ENV] USE_PROXY - ${USE_PROXY}`)
        logMessage("[NET] Using direct server address & port");
    }

    return url;
}

const SERVER_URL = serverUrl();

var zoom_amount = 1; // Default zoom level



// Now you can use these variables in your code
console.log("API URL:", `${SERVER_URL}`);



document.addEventListener('DOMContentLoaded', function() {
    // Set the Create tab as default visible
    showTab('create-tab', 'create-content');


    // Log server details when page loads
    logMessage(`[NET] Server Address - ${SERVER_NAME_API}`);
    logMessage(`[NET] API port - ${API_PORT}`);
    logMessage(`[API] ${API_KEY}`);

    // Add event listeners for tabs
    document.getElementById('create-tab').addEventListener('click', function() {
        showTab('create-tab', 'create-content');
        console.log("[TAB] Show tab - CREATE ")
    });

    document.getElementById('images-tab').addEventListener('click', function() {
        console.log("[TAB] Show tab - IMAGES ")
        showTab('images-tab', 'images-content'); 


        console.log("[TAB] fetching images list")
        // loadImages(); // Ensure the images load when this tab is clicked
    });

    document.getElementById('templates-tab').addEventListener('click', function() {
        console.log("[TAB] Show tab - TEMPLATES ")
        showTab('templates-tab', 'templates-content');
    });

    document.getElementById('log-tab').addEventListener('click', function() {
        console.log("[TAB] Show tab - LOGS ")
        showTab('log-tab', 'log-content');
    });
});


function showTab(tabId, contentId) {
    // Deactivate all tabs
    document.querySelectorAll('.tabs button').forEach(tab => {
        tab.classList.remove('active');
    });

    // Hide all content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
        content.style.display = 'none'; // Ensure content is hidden
    });

    // Activate the selected tab and content
    const tabElement = document.getElementById(tabId);
    const contentElement = document.getElementById(contentId);

    if (tabElement && contentElement) {
        tabElement.classList.add('active');
        contentElement.classList.add('active');
        contentElement.style.display = 'block'; // Show the selected content
    } else {
        console.error(`[TAB] Tab or content not found: ${tabId}, ${contentId}`);
    }
}

function logMessage(message) {
    const logOutput = document.getElementById('log-output');
    if (logOutput) {
        logOutput.value += message + "\n";
        logOutput.scrollTop = logOutput.scrollHeight; // Scroll to the bottom
    } else {
        console.error("Log output element not found.");
    }

    // Show the Log tab
    showTab('log-tab', 'log-content');
    

}
 
function createNewTemplate() {
    const defaultTemplate = "<html>\n<head>\n<title>{{artist_name}}</title>\n</head>\n<body>\n<h1>{{artist_name}}</h1>\n</body>\n</html>";
    editor.setValue(defaultTemplate);
    document.getElementById('template-name').value = 'new_template.html';
    document.getElementById('save-template').disabled = false;
}

// Existing saveTemplate function with logging
function saveTemplate() {
        const templateName = document.getElementById('template-name').value.trim();
        const content = editor.getValue();

        if (!templateName) {
            alert('Please provide a template name to save.');
            return;
        }

        const postData = `template_name=${encodeURIComponent(templateName)}&template_content=${encodeURIComponent(content)}`;
        
        console.log("Post data being sent:", postData);  // Log data for debugging

        const xhr = new XMLHttpRequest();
        // Ensure this URL has the correct port for your FastAPI service
        xhr.open('POST', `${SERVER_URL}/api/save_template`, true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    alert('Template saved successfully.');
                } else {
                    alert('Error saving template: ' + xhr.responseText);
                }
            }
        };
        xhr.send(postData);
    }



showTab('create-tab', 'create-content'); // Show the Create tab by default

src="https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.12/ace.js"

    // Initialize Ace Editor for HTML
    editor = ace.edit("html-editor");
    editor.setTheme("ace/theme/clouds_midnight");
    editor.session.setMode("ace/mode/html");
    editor.setShowPrintMargin(false);

    // Initialize JSON editor
    jsonEditor = ace.edit("json-editor");
    jsonEditor.setTheme("ace/theme/clouds_midnight");
    jsonEditor.session.setMode("ace/mode/json");
    jsonEditor.setShowPrintMargin(false);

    // Set default JSON data
    const defaultJson = `{
        "artist_name": "John Doe",
        "track_title": "My Awesome Track",
        "background_image_url": "https://example.com/background.jpg",
        "release_date": "2023-01-01",
        "genre": "Electronic",
        "copyright": "(c) Unsplash.com"
    }`;
    jsonEditor.setValue(defaultJson, -1);

    const renderedImageElement = document.getElementById('rendered-image');
    const widthInput = document.getElementById('width');
    const heightInput = document.getElementById('height');
    const previewContainer = document.getElementById('preview');
    const templateList = document.getElementById('template-list');
    const templateNameInput = document.getElementById('template-name');
    let currentTemplate = null;

    function updateIframeContent() {
        let templateContent = editor.getValue(); // Get HTML from Ace Editor
        let jsonData;
    
        // Parse JSON from JSON Editor
        try {
            jsonData = JSON.parse(jsonEditor.getValue());
        } catch (error) {
            console.log("[EDT] Invalid JSON")
            return;
        }
    
        // Find all placeholders in the template content like {{some_variable}}
        const placeholderRegex = /{{\s*([\w_]+)\s*}}/g;
        let match;
        const foundPlaceholders = new Set();
        
        while ((match = placeholderRegex.exec(templateContent)) !== null) {
            const placeholder = match[1];
            foundPlaceholders.add(placeholder);
        }
    
        // Add missing placeholders from the template content to the JSON
        let jsonDataUpdated = false;
        foundPlaceholders.forEach(placeholder => {
            if (!(placeholder in jsonData)) {
                jsonData[placeholder] = ""; // Add new placeholder with empty value
                jsonDataUpdated = true;
            }
        });
    
        // Remove extra placeholders from JSON that are not in the template anymore
        for (const key in jsonData) {
            if (!foundPlaceholders.has(key)) {
                delete jsonData[key];
                jsonDataUpdated = true;
            }
        }
    
        // If JSON was updated, reflect it back in the JSON editor
        if (jsonDataUpdated) {
            jsonEditor.setValue(JSON.stringify(jsonData, null, 4), -1);
        }
    
        // Replace placeholders in HTML template with corresponding JSON data
        for (const key in jsonData) {
            const value = jsonData[key];
            const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
            templateContent = templateContent.replace(regex, value);
        }
    
        // Create a blob for the updated HTML content and set it as the iframe's source
        const blob = new Blob([templateContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const iframe = document.getElementById('rendered-image');
        iframe.src = url;
    
        // Resize iframe content based on user-defined dimensions
        const iframeWidth = parseInt(document.getElementById('width').value) || 800;
        const iframeHeight = parseInt(document.getElementById('height').value) || 600;
        iframe.style.width = `${iframeWidth}px`;
        iframe.style.height = `${iframeHeight}px`;
    
        // Calculate scale factor to fit the iframe content in the preview quadrant
        const previewContainer = document.getElementById('preview');
        const quadrantWidth = previewContainer.clientWidth;
        const quadrantHeight = previewContainer.clientHeight;
        const scaleX = quadrantWidth / iframeWidth;
        const scaleY = quadrantHeight / iframeHeight;
        const scale = Math.min(scaleX, scaleY);
    
        // Apply the calculated scale to the iframe content and the zoom function
        const finalScale = scale * zoom_amount;
        iframe.style.transform = `scale(${finalScale})`;

        // iframe.style.transform = `scale(${scale})`;  // <- use for no zoom

        iframe.style.transformOrigin = 'center center'; // Keep the scale centered
    }
    
    



    // Function to check for dimensions in the HTML template
    function extractDimensionsFromTemplate() {
        const templateContent = editor.getValue();

        // Regex to find .cover width and height
        const widthMatch = templateContent.match(/\.cover\s*{[^}]*width:\s*(\d+)px/);
        const heightMatch = templateContent.match(/\.cover\s*{[^}]*height:\s*(\d+)px/);

        if (widthMatch && heightMatch) {
            // Set the input values and disable them
            widthInput.value = widthMatch[1];
            heightInput.value = heightMatch[1];
            widthInput.disabled = true;
            heightInput.disabled = true;
        } else {
            // Enable inputs if dimensions are not found
            widthInput.disabled = false;
            heightInput.disabled = false;
        }
    }

    // Update preview and extract dimensions in real-time
    editor.session.on('change', function() {
        extractDimensionsFromTemplate();
        updateIframeContent();
    });
    jsonEditor.session.on('change', updateIframeContent);
    window.addEventListener('resize', updateIframeContent);

    // Initial loading
    extractDimensionsFromTemplate();
    updateIframeContent();

    // Load template list
    function loadTemplateList() {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', 'list_templates.php', true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4 && xhr.status == 200) {
                const response = JSON.parse(xhr.responseText);
                templateList.innerHTML = '';
                response.templates.forEach(template => {
                    const option = document.createElement('option');
                    option.value = template;
                    option.text = template;
                    templateList.appendChild(option);
                });
            }
        };
        xhr.send();
    }

    loadTemplateList();

    // Load the selected template into the editor
    function loadTemplate(templateName) {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', 'load_template.php?template=' + encodeURIComponent(templateName), true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                editor.setValue(xhr.responseText, -1);
                templateNameInput.value = templateName;
                currentTemplate = templateName;
            }
        };
        xhr.send();
    }

    // Save the current template
    function saveTemplate() {
        let templateName = document.getElementById('template-name').value.trim();

        // Check if templateName already ends with ".html"; if not, add it
        if (!templateName.endsWith('.html')) {
            templateName += '.html';
        }


        const content = editor.getValue();

        if (!templateName) {
            alert('Please provide a template name to save.');
            return;
        }

        const postData = `template_name=${encodeURIComponent(templateName)}&template_content=${encodeURIComponent(content)}`;
        
        console.log("Post data being sent:", postData);  // Log data for debugging

        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'save_template.php', true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    alert('Template saved successfully.');
                    loadTemplateList();
                } else {
                    alert('Error saving template: ' + xhr.responseText);
                }
            }
        };
        xhr.send(postData);
    }


    function downloadTemplate() {
        const selectedTemplate = document.getElementById('template-list').value;
        const logOutput = document.getElementById('log-output');
    
        if (!selectedTemplate) {
            logOutput.value += "Please select a template to download.\n";
            logOutput.scrollTop = logOutput.scrollHeight;
            return;
        }
    
        // Assuming templates are accessible directly via a public URL path
        const templateUrl = `/app/api/templates/${selectedTemplate}.html`;
    
        // Fetch the template to log the response status
        fetch(templateUrl)
            .then(response => {
                if (response.ok) {
                    logOutput.value += `Template ${selectedTemplate} downloaded successfully.\n`;
                    // Create and click the download link
                    const link = document.createElement('a');
                    link.href = templateUrl;
                    link.download = selectedTemplate;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                } else {
                    logOutput.value += `Failed to download template: ${selectedTemplate} - ${response.statusText}\n`;
                }
                logOutput.scrollTop = logOutput.scrollHeight;
            })
            .catch(error => {
                logOutput.value += `Error: ${error.message}\n`;
                logOutput.scrollTop = logOutput.scrollHeight;
            });
    }
    
    
    // Event listener for template list change
    templateList.addEventListener('change', function() {
        const selectedTemplate = templateList.value;
        if (selectedTemplate && selectedTemplate !== currentTemplate) {
          /*
            if (currentTemplate) {
                saveTemplate();
            }
          */      
            loadTemplate(selectedTemplate);
        }
    });



    // Event listener for save button
    document.getElementById('save-template').addEventListener('click', saveTemplate);

    // Event listener for download button
    document.getElementById('download-image').addEventListener('click', function() {
        const templateContent = editor.getValue();
        const jsonData = jsonEditor.getValue();
        const width = parseInt(widthInput.value) || 800;
        const height = parseInt(heightInput.value) || 600;

        logMessage("[IMG] Starting image rendering..");

        const xhr = new XMLHttpRequest();

        logMessage(`[IMG] using url ${SERVER_URL}/api/generate_image`);

        xhr.open('POST', `${SERVER_URL}/api/generate_image`, true);

        xhr.setRequestHeader('Content-Type', 'application/json');
        
        // Set the API key header
        logMessage("[IMG] using key " + API_KEY);
        xhr.setRequestHeader('X-API-Key', API_KEY);

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                try {
                    const response = JSON.parse(xhr.responseText);
                    if (response.image_data) {
                        const a = document.createElement('a');
                        a.href = 'data:image/png;base64,' + response.image_data;
                        a.download = templateNameInput.value.trim() || 'template.png';
                        a.click();
                        logMessage("[IMG] Success");
                    } else {
                        alert('Error generating image: No image data found');
                        logMessage("[IMG] [ERROR] - No image data found");
                    }
                } catch (error) {
                    alert('Error generating image: Invalid response data');
                    logMessage("[IMG] [ERROR] - Invalid response data");
                }
            } else if (xhr.readyState === 4) {
                alert('Error generating image: ' + xhr.responseText);
                logMessage("[IMG] [ERROR] - " + xhr.responseText);
            }
        };


        const requestData = {
            template_content: templateContent,
            width: width,
            height: height,
            data: JSON.parse(jsonData)
        };

        xhr.send(JSON.stringify(requestData));
        // logMessage("[IMG] JSON data - " + JSON.stringify(requestData));
    });


function showImagePreview(image) {
    const img = document.getElementById('image-preview');
    img.src = `/app/api/output/${image}`; // Replace with the correct path to your images directory
    img.style.display = image ? 'block' : 'none';
}

// Event listener for when an image is selected
document.getElementById('image-list').addEventListener('change', function() {
    const selectedFilename = this.value;
    showImagePreview(this.value);
});


function downloadSelectedImage() {
const selectedImage = document.getElementById('image-list').value;
if (selectedImage) {
    window.location.href = '/app/api/output' + selectedImage; // Adjust path accordingly
}
}


// ------------------------------------------------- //
// ------------------------------------------------- //
//            SCRIPTS FOR IMAGE LIST TAB             //
// ------------------------------------------------- //
// ------------------------------------------------- //

// Load images when the images tab is clicked
document.getElementById('images-tab').addEventListener('click', function() {
    loadImages();
});

// Show the preview of the selected image
document.getElementById('image-list').addEventListener('change', function() {
    const selectedImage = this.selectedOptions[0];
    const imgUrl = selectedImage.dataset.url;
    const img = document.getElementById('image-preview');
    
    if (imgUrl) {
        img.src = imgUrl;
        img.style.display = 'block';
    } else {
        img.style.display = 'none';
    }
});


// Download selected image
document.getElementById('download-image').addEventListener('click', function() {
    const selectedImage = document.getElementById('image-list').value;
    if (selectedImage) {
        window.location.href = `/path/to/images/${selectedImage}`;
    }
});

// Helper function to format file size
function formatSize(bytes) {
    const units = ['B', 'KB', 'MB', 'GB'];
    const factor = Math.floor((Math.log(bytes) / Math.log(1024)));
    return `${(bytes / Math.pow(1024, factor)).toFixed(2)} ${units[factor]}`;
}

// Function to delete the selected image using the FastAPI endpoint
async function deleteSelectedImage() {
    const imageList = document.getElementById("image-list");
    const selectedImage = imageList.value;

    if (!selectedImage) {
        logMessage("No image selected to delete.");
        return;
    }

    console.log("Deleting file:", selectedImage);  // Debugging log

    try {
        const response = await fetch(`${SERVER_URL}/delete_image?file=${encodeURIComponent(selectedImage)}`, {
            method: 'GET', // Use GET as the FastAPI endpoint is defined with @app.get
            headers: {
                "X-API-Key": API_KEY
            }
        });

        const result = await response.json();
        logMessage(result.message);
        if (result.status === "success") {
            loadImages(); // Refresh image list after deletion
        } else {
            logMessage("Failed to delete image: " + result.message);
        }
    } catch (error) {
        logMessage("Error deleting selected image: " + error);
    }
}

// Function to delete all images using the FastAPI endpoint
async function deleteAllImages() {
    if (confirm('Are you sure you want to delete all images?')) {
        try {
            const response = await fetch(`${SERVER_URL}/delete_all_images`, {
                method: 'GET', // Use GET since the FastAPI endpoint is defined with @app.get
                headers: {
                    "X-API-Key": API_KEY
                }
            });

            const result = await response.json();
            logMessage(result.message);
            if (result.status === "success") {
                loadImages(); // Refresh image list after deletion
            }
        } catch (error) {
            logMessage("Error deleting all images: " + error);
        }
    }
}

// Function to load images and populate the image list
function loadImages() {
    const imageList = document.getElementById('image-list');
    imageList.innerHTML = ''; // Clear list

    fetch(`${SERVER_URL}/api/list_images`)  // Use the new FastAPI endpoint
        .then(response => response.json())
        .then(data => {
            data.images.forEach(image => {
                const option = document.createElement('option');
                option.value = image.filename;
                option.textContent = `${image.filename} (${(image.size / 1024).toFixed(2)} KB)`;
                option.dataset.url = image.url;
                option.dataset.createdAt = new Date(image.created_at * 1000).toLocaleString();
                imageList.appendChild(option);
            });
        })
        .catch(error => console.error('Error loading images:', error));
}

// Event listener for Delete Selected Image button
document.getElementById('delete-image').addEventListener('click', deleteSelectedImage);


// Event listener for Delete All Images button
document.getElementById('delete-all-images').addEventListener('click', deleteAllImages);


// Event listener for image list to show preview
document.getElementById('image-list').addEventListener('change', function() {
    const selectedFilename = this.value;
    showImagePreview(selectedFilename);
});


function showImagePreview(image) {
    const img = document.getElementById('image-preview');
    img.src = `${SERVER_URL}/output/${image}`; // Adjust the URL if necessary
    img.style.display = image ? 'block' : 'none';
}




// ZOOM CONTROLS //


document.getElementById('zoom-in').addEventListener('click', () => {
    zoom_amount += 0.1; // Adjust zoom increment as needed
    updateIframeContent(); // Re-render the iframe
});

document.getElementById('zoom-out').addEventListener('click', () => {
    zoom_amount = Math.max(0.1, zoom_amount - 0.1); // Prevent zooming out too much
    updateIframeContent(); // Re-render the iframe
});
