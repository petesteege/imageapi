/**
 * images.js - Handles image generation and management
 */

// Initialize when the document is ready
document.addEventListener('DOMContentLoaded', function() {
    // Setup image-related event listeners
    setupImageEventListeners();
    
    // Load initial image data
    loadImagesList();
});

// Setup all event listeners related to image functionality
function setupImageEventListeners() {
    // Image list change
    document.getElementById('image-list').addEventListener('change', onImageSelected);
    
    // Delete Selected Image button
    document.getElementById('delete-image').addEventListener('click', deleteSelectedImage);
    
    // Delete All Images button
    document.getElementById('delete-all-images').addEventListener('click', deleteAllImages);
    
    // Download Selected Image button
    document.getElementById('download-selected-image').addEventListener('click', downloadSelectedImage);
}

// Load the list of generated images
function loadImagesList() {
    const imageList = document.getElementById('image-list');
    
    fetch(`${window.api.getServerUrl()}/api/list_images`)
        .then(response => response.json())
        .then(data => {
            // Clear the list
            imageList.innerHTML = '';
            
            // Add each image to the list
            data.images.forEach(image => {
                const option = document.createElement('option');
                option.value = image.filename;
                
                // Format file size
                const fileSizeKB = (image.size / 1024).toFixed(2);
                
                option.textContent = `${image.filename} (${fileSizeKB} KB)`;
                option.dataset.url = `${image.url}/api/output/${image.filename}`;
                
                // Format date if available
                if (image.created_at) {
                    const date = new Date(image.created_at * 1000);
                    option.dataset.date = date.toLocaleString();
                }
                
                imageList.appendChild(option);
            });
            
            window.api.logMessage(`[IMG] Loaded ${data.images.length} images`);
        })
        .catch(error => {
            window.api.logMessage(`[ERROR] Failed to load images: ${error.message}`);
        });
}

// Handle image selection
function onImageSelected() {
    const imageList = document.getElementById('image-list');
    const imagePreview = document.getElementById('image-preview');
    
    const selectedOption = imageList.options[imageList.selectedIndex];
    
    if (selectedOption) {
        const imageUrl = selectedOption.dataset.url;
        
        if (imageUrl) {
            imagePreview.src = imageUrl;
            imagePreview.style.display = 'block';
            
            window.api.logMessage(`[IMG] Preview image: ${selectedOption.value}`);
        }
    } else {
        imagePreview.style.display = 'none';
    }
}

// Delete the selected image
function deleteSelectedImage() {
    const imageList = document.getElementById('image-list');
    const selectedImage = imageList.value;
    
    if (!selectedImage) {
        alert("Please select an image to delete");
        return;
    }
    
    if (!confirm(`Are you sure you want to delete the image '${selectedImage}'?`)) {
        return;
    }
    
    fetch(`${window.api.getServerUrl()}/api/delete_image?file=${encodeURIComponent(selectedImage)}`, {
        method: 'GET',
        headers: {
            'X-API-Key': window.api.getAPIKey()
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            window.api.logMessage(`[IMG] Deleted image: ${selectedImage}`);
            loadImagesList();
        } else {
            alert(`Error deleting image: ${data.message}`);
            window.api.logMessage(`[ERROR] Failed to delete image: ${data.message}`);
        }
    })
    .catch(error => {
        alert(`Error: ${error.message}`);
        window.api.logMessage(`[ERROR] Delete image exception: ${error.message}`);
    });
}

// Delete all generated images
function deleteAllImages() {
    if (!confirm("Are you sure you want to delete ALL images? This cannot be undone.")) {
        return;
    }
    
    fetch(`${window.api.getServerUrl()}/api/delete_all_images`, {
        method: 'GET',
        headers: {
            'X-API-Key': window.api.getAPIKey()
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            window.api.logMessage(`[IMG] Deleted all images`);
            loadImagesList();
        } else {
            alert(`Error deleting images: ${data.message}`);
            window.api.logMessage(`[ERROR] Failed to delete all images: ${data.message}`);
        }
    })
    .catch(error => {
        alert(`Error: ${error.message}`);
        window.api.logMessage(`[ERROR] Delete all images exception: ${error.message}`);
    });
}

// Download a selected image
function downloadSelectedImage() {
    const imageList = document.getElementById('image-list');
    const selectedImage = imageList.value;
    
    if (!selectedImage) {
        alert("Please select an image to download");
        return;
    }
    
    // Create a link to download the image
    const a = document.createElement('a');
    a.href = `${window.api.getServerUrl()}/api/output/${selectedImage}`;
    a.download = selectedImage;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    window.api.logMessage(`[IMG] Downloaded image: ${selectedImage}`);
}

// Download generated image - called from api.js
function downloadImage() {
    const templateEditor = window.editorFunctions.getTemplateEditor();
    const dataEditor = window.editorFunctions.getDataEditor();
    
    if (!templateEditor || !dataEditor) {
        window.api.logMessage("[ERROR] Editors not initialized");
        return;
    }
    
    const templateContent = templateEditor.getValue();
    let jsonData;
    
    try {
        jsonData = JSON.parse(dataEditor.getValue());
    } catch (error) {
        alert("Invalid JSON format in data editor");
        window.api.logMessage("[ERROR] JSON parse error: " + error.message);
        return;
    }
    
    // Get dimensions
    const width = parseInt(document.getElementById('width').value) || 800;
    const height = parseInt(document.getElementById('height').value) || 800;
    
    window.api.logMessage("[IMG] Starting image rendering...");
    
    // Prepare request data
    const requestData = {
        template_content: templateContent,
        width: width,
        height: height,
        data: jsonData,
        delay: 1000 // 1 second delay to ensure all assets are loaded
    };
    
    // Send the request to generate the image
    fetch(`${window.api.getServerUrl()}/api/generate_image`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-API-Key': window.api.getAPIKey()
        },
        body: JSON.stringify(requestData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Server returned ${response.status}: ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.image_data) {
            // Create a download link
            const a = document.createElement('a');
            a.href = 'data:image/png;base64,' + data.image_data;
            
            // Use template name for download file name if available
            const templateName = document.getElementById('template-name').value.trim();
            const fileName = templateName ? templateName.replace('.html', '.png') : 'template.png';
            
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            window.api.logMessage("[IMG] Image generated and downloaded successfully");
            
            // Refresh images list
            loadImagesList();
        } else {
            alert('Error generating image: No image data found');
            window.api.logMessage("[IMG] [ERROR] - No image data found");
        }
    })
    .catch(error => {
        alert(`Error generating image: ${error.message}`);
        window.api.logMessage(`[IMG] [ERROR] - ${error.message}`);
    });
}

// Export functions for use in other modules
window.imageFunctions = {
    loadImagesList,
    downloadImage,
    deleteSelectedImage,
    deleteAllImages,
    downloadSelectedImage
};