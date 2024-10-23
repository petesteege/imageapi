<!-- File: web/render_template.php -->
<?php
// render_template.php

// Enable error reporting (for debugging purposes)
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Check if template and data are set
if (isset($_POST['template']) && isset($_POST['data'])) {
    $templateContent = $_POST['template'];
    $jsonData = $_POST['data'];

    // Decode JSON data
    $data = json_decode($jsonData, true);
    if ($data === null && json_last_error() !== JSON_ERROR_NONE) {
        echo 'Invalid JSON data.';
        exit;
    }

    // Render the template with data
    try {
        // Use Twig for template rendering
        require_once 'vendor/autoload.php';

        $loader = new \Twig\Loader\ArrayLoader([
            'template' => $templateContent,
        ]);
        $twig = new \Twig\Environment($loader);

        $renderedContent = $twig->render('template', $data);

        echo $renderedContent;
    } catch (Exception $e) {
        echo 'Error rendering template: ' . $e->getMessage();
    }
} else {
    echo 'Template or data not provided.';
}
?>
