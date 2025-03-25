    <!-- V 21.51 -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PSM Template Editor</title>
    
    <!-- Define environment variables in JavaScript -->
    <script type="text/javascript">
        window.config = {
            SERVER_NAME_API: "<?php echo getenv('SERVER_NAME_API'); ?>",
            API_PORT: "<?php echo getenv('API_PORT'); ?>",
            SERVER_NAME_GUI: "<?php echo getenv('SERVER_NAME_GUI'); ?>",
            WEB_PORT: "<?php echo getenv('WEB_PORT'); ?>",
            API_KEY: "<?php echo getenv('API_KEY'); ?>",
            PROTOCOL: "<?php echo getenv('PROTOCOL'); ?>",
            USE_PROXY: "<?php echo getenv('USE_PROXY'); ?>",
            VERSION: "<?php echo getenv('VERSION'); ?>"
        };
    </script>
    
    <!-- Include Ace Editor from CDN -->
<!-- Update Ace Editor version -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/ace/1.32.3/ace.js"></script>    
    <!-- Include our scripts - order matters -->
    
    <script src="scripts/window.js"></script>
    <script src="scripts/preview.js"></script>
    <script src="scripts/api.js"></script>

    
    <!-- Include CSS -->
    <link rel="stylesheet" href="css/main.css">
    <link rel="stylesheet" href="css/preview.css">
    <link rel="stylesheet" href="css/window.css">
    <link rel="stylesheet" href="css/tabs.css">
</head>

<body>
    <!-- Header -->
    <div id="header">
        Coverart Template Generator <?php 
                $version = getenv('VERSION');
                if ($version && trim($version) !== '') {
                    echo "v" . $version;
                }
            ?>
    </div>

    <!-- Main container -->
    <div id="container">
        <!-- Left Half -->
        <div id="left-half">
            <!-- Top Section - Template Editor -->
            <div class="section-top" id="template-section" style="flex: 1 1 65%;">
                <div class="section-header" >Template Editor</div>
                <div class="section-content">
                    <div id="template-editor" class="editor"></div>
                </div>
            </div>
            
            <!-- Divider -->
            <div class="divider" id="left-divider"></div>
            
            <!-- Bottom Section - Data Editor -->
            <div class="section-bottom" id="data-section" style="flex: 1 1 35%;">
                <div class="section-header">API Data Editor</div>
                <div class="section-content">
                    <div id="data-editor" class="editor"></div>
                </div>
            </div>
        </div>

        <!-- Right Half -->
        <div id="right-half">
            <!-- Top Section - Preview (flexible height to fill available space) -->
            <div class="section-top" id="preview-section">
                <div class="section-header">Preview</div>
                <div class="section-content">
                    <!-- Preview frame will be inserted here by JavaScript -->
                </div>
            </div>
            
            <!-- Bottom Section - Tabs (Fixed height) -->
            <div class="section-bottom" id="tabs-section">
                <!-- Tabs navigation -->
                <div class="tabs">
                    <div class="tab active" data-tab="templates">Templates</div>
                    <div class="tab " data-tab="create">Create</div>
                    <div class="tab" data-tab="images">Images</div>
                    <div class="tab" data-tab="log">Log</div>
                    <div class="tab" data-tab="about">About</div>
                </div>
                
                <!-- Tab contents -->

    
            <div class="tab-content" id="create-tab">
                <h2>Create Image</h2>
                
                <table class="create-table" style="border-collapse: collapse; border: 1px solid white;">
                    <tr>
                        <td style="border: 1px solid white;">
                            <button class="button" id="create-new-template">Create New Template</button>
                        </td>
                        <td style="border: 1px solid white;">Name:</td>
                        <td colspan="3" style="border: 1px solid white;">
                            <input type="text" id="template-name" placeholder="template_name.html">
                        </td>
                    </tr>
                    <tr>
                        <td style="border: 1px solid white;"></td>
                        <td style="border: 1px solid white;">Height (px):</td>
                        <td style="border: 1px solid white;">
                            <input type="number" id="height" value="800">
                        </td>
                        <td style="border: 1px solid white;">Width (px):</td>
                        <td style="border: 1px solid white;">
                            <input type="number" id="width" value="800">
                        </td>
                    </tr>
                    <tr>
                        <td style="border: 1px solid white;">
                            <button class="button" id="save-template">Save Template</button>
                        </td>
                        <td style="border: 1px solid white;">Description:</td>
                        <td colspan="3" rowspan="2" style="border: 1px solid white;">
                            <textarea id="template-description" style="width: 100%; height: 100%;" placeholder="Enter template description"></textarea>
                        </td>
                    </tr>
                    <tr>
                        <td style="border: 1px solid white;">
                            <button class="button" id="download-image">Download Image</button>
                        </td>
                        <td style="border: 1px solid white;"></td>
                    </tr>
                </table>
            </div>


            <div class="tab-content" id="images-tab">
                <h2>Images</h2>                  
                    <div class="image-row-container">
                        <!-- Image Preview (Left) -->
                        <div class="image-preview-container">
                        <img id="image-preview" src="" alt="Image Preview" onerror="this.style.display='none'"/>
                        </div>
                        
                        <!-- Image List (Middle) -->
                        <div class="image-list-container">
                        <select class="list" id="image-list" size="10"></select>
                        </div>
                        
                        <!-- Image Buttons (Right, vertically stacked) -->
                        <div class="image-controls">
                        <button class="button" id="delete-image">Delete Selected</button>
                        <button class="button" id="delete-all-images">Delete All</button>
                        <button class="button" id="download-selected-image">Download Selected</button>
                        </div>
                    </div>
            </div>
                

                <div class="tab-content active" id="templates-tab">
                    <h2>Templates</h2>
                    <div class="templates-list-container">
                        <select class="list" id="templates-list" size="10"></select>
                    </div>
                    <div class="templates-controls">
                        <button class="button" id="load-template">Load</button>
                        <button class="button" id="download-template">Download</button>
                        <button class="button" id="delete-template">Delete</button>
                        <button class="button" id="upload-template">Upload</button>
                    </div>

                </div>

                <div class="tab-content" id="log-tab">
                    <h2>Logs</h2>
                    <textarea class="list"  id="log-output" style="resize:none;" readonly></textarea>
                </div>


                <div class="tab-content" id="about-tab">
                    <h2>About</h2>
                    <div class="text" id="about-area">
                        <div id="about-title">Help</div>
                        <div class="text" id="about-text">
                            <p>Template Editor is a frontend tool for creating and editing templates for the Coverart Generator API.</p>
                            <p>It allows you to create and edit templates, and to manage images and templates on the server.</p>
                            <br>
                            <p>For more information, please visit <a id="help-link" href="https://petesteege.com/devlopment/imageapi">https://petesteege.com/devlopment/imageapi</a></p>
                            <br>
                            <p>version 1.3</p>

                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>

    <script src="scripts/functions.js"></script>

    <script src="scripts/templates.js"></script>
    <script src="scripts/images.js"></script>
    <script src="scripts/description-handler.js"></script>
    <script src="scripts/json-handler.js"></script>


</body>
</html>
