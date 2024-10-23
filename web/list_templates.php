<?php
// list_templates.php

$templatesDir = '/app/api/templates'; // Adjust path if necessary
$templates = [];

if (is_dir($templatesDir)) {
    $files = scandir($templatesDir);
    foreach ($files as $file) {
        if (pathinfo($file, PATHINFO_EXTENSION) === 'html') {
            $templates[] = pathinfo($file, PATHINFO_FILENAME);
        }
    }
} else {
    echo "Directory not found: $templatesDir";
}

header('Content-Type: application/json');
echo json_encode(['templates' => $templates]);
