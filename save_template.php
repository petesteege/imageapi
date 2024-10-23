<?php
// Log the initial request for debugging
error_log("Request received - Checking data presence...");
error_log("template_name: " . (isset($_POST['template_name']) ? $_POST['template_name'] : 'Not set'));
error_log("template_content length: " . (isset($_POST['template_content']) ? strlen($_POST['template_content']) : 'Not set'));

if (!isset($_POST['template_name']) || empty($_POST['template_name'])) {
    http_response_code(400);
    echo 'Invalid request: template_name is missing or empty.';
    error_log("Invalid request: template_name is missing or empty.");
    exit;
}

if (!isset($_POST['template_content']) || empty($_POST['template_content'])) {
    http_response_code(400);
    echo 'Invalid request: template_content is missing or empty.';
    error_log("Invalid request: template_content is missing or empty.");
    exit;
}

$templateName = basename($_POST['template_name']);
$templatePath = '/app/api/templates/' . $templateName;

if (file_put_contents($templatePath, $_POST['template_content']) !== false) {
    echo 'Template saved successfully.';
    error_log("Success: Template '$templateName' saved to '$templatePath'.");
} else {
    http_response_code(500);
    echo 'Error saving template';
    error_log("Error: Unable to save template '$templateName' to '$templatePath'. Check file permissions.");
}
