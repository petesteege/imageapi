<?php
$directory = '/app/api/output';
$images = [];

if (is_dir($directory)) {
    foreach (scandir($directory) as $file) {
        if ($file !== '.' && $file !== '..' && is_file("$directory/$file")) {
            $images[] = ["filename" => $file];
        }
    }
}

header('Content-Type: application/json');
echo json_encode($images);
