<?php
// load_template.php

if (isset($_GET['template'])) {
    $templateName = basename($_GET['template']); // Sanitize input
    $templatePath = '/app/api/templates/' . $templateName . '.html'; // Adjust path if necessary

    if (file_exists($templatePath)) {
        header('Content-Type: text/html');
        readfile($templatePath);
    } else {
        http_response_code(404);
        echo 'Template not found.';
    }
} else {
    http_response_code(400);
    echo 'No template specified.';
}
