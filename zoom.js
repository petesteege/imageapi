// ZOOM FUNCTIONS
const iframe = document.getElementById('rendered-image');
const zoomInButton = document.getElementById('zoom-in');
const zoomOutButton = document.getElementById('zoom-out');

let scale = 1;  // Initial zoom scale
const scaleStep = 0.1;  // Step size for zooming in/out

// Function to apply zoom to the content inside the iframe and adjust canvas size
function setZoom(scale) {
    const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
    const body = iframeDocument.body;

    if (body) {
        // Get the dimensions from the input fields
        const width = parseInt(widthInput.value) || 1440;
        const height = parseInt(heightInput.value) || 1440;

        // Set the width and height of the canvas based on inputs
        body.style.width = `${width}px`;
        body.style.height = `${height}px`;

        // Scale the content (canvas) inside the iframe
        body.style.transform = `scale(${scale})`;
        body.style.transformOrigin = 'center center';  // Keep zoom centered

        // Adjust iframe size to match canvas size and zoom level
        iframe.style.width = `${width * scale}px`;
        iframe.style.height = `${height * scale}px`;

        // Ensure the content scrolls within the iframe if it overflows
        body.style.overflow = 'hidden';
    } else {
        console.error("Iframe content body not found.");
    }
}

// Zoom in button
zoomInButton.addEventListener('click', () => {
    scale += scaleStep;  // Increase zoom scale
    setZoom(scale);
});

// Zoom out button
zoomOutButton.addEventListener('click', () => {
    if (scale > scaleStep) {
        scale -= scaleStep;  // Decrease zoom scale
        setZoom(scale);
    }
});

// Ensure the zoom and canvas size are applied after the iframe content loads
iframe.onload = () => {
    setZoom(scale);
};

