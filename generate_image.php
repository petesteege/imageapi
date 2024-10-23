<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$input = file_get_contents('php://input');
$requestData = json_decode($input, true);

if ($requestData && isset($requestData['template_content'])) {
    $templateContent = $requestData['template_content'];
    $width = isset($requestData['width']) ? intval($requestData['width']) : 800;
    $height = isset($requestData['height']) ? intval($requestData['height']) : 600;

    if (isset($requestData['data'])) {
        $data = $requestData['data'];
    } else {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Data is missing.']);
        exit;
    }

    $apiRequestData = [
        'template_content' => $templateContent,
        'width' => $width,
        'height' => $height,
        'data' => $data
    ];

    // Dynamically construct the API URL

    $protocol = getenv('PROTOCOL') ?: 'http';
    $serverNameApi = getenv('SERVER_NAME_API') ?: 'localhost';
    $apiPort = getenv('API_PORT') ?: '8000';
    $useProxy = getenv('USE_PROXY');
    
    if ($useProxy) {
        $serverUrl = $protocol . '://' . $serverNameApi;
        error_log("[NET] Using proxy mask");
    } else {
        $serverUrl = $protocol . '://' . $serverNameApi . ':' . $apiPort;
        error_log("[NET] Using direct server address & port");
    }
    
    // Construct the full API URL by appending the endpoint to $serverUrl
    $apiUrl = $serverUrl . '/api/generate_image';
    

    $ch = curl_init($apiUrl);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($apiRequestData));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'X-API-Key: ' . getenv('API_KEY')
    ]);

    $apiResponse = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    
    if ($apiResponse === false) {
        error_log('cURL error: ' . curl_error($ch));
    } else {
        error_log('API Response: ' . $apiResponse);
    }

    curl_close($ch);

    if ($httpCode == 200) {
        $response = json_decode($apiResponse, true);
        if ($response && isset($response['image_data'])) {
            header('Content-Type: application/json');
            echo json_encode([
                'status' => 'success',
                'image_data' => $response['image_data']
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Error generating image.']);
        }
    } else {
        http_response_code($httpCode);
        echo json_encode(['status' => 'error', 'message' => 'Error communicating with API. HTTP Code: ' . $httpCode]);
    }
} else {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid request data.']);
}
