<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

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
            LOGO_IMG: "<?php echo getenv('LOGO_IMG'); ?>"
 

        };
    </script>
    
    <title>PSM Template Editor</title>
    
    <!-- Link to the CSS file -->
    <link rel="stylesheet" href="css/main.css">
    <link rel="stylesheet" href="css/window.css">
    <link rel="stylesheet" href="css/editor.css">
    <link rel="stylesheet" href="css/tabs.css">
    <link rel="stylesheet" href="css/preview.css">

</head>
<body>
    <div id="header">
        <img id="logo" src="<?php echo getenv('LOGO_IMG'); ?>"></img>
        <div id="header-text">Coverart Template Generator v1.2</div>
    </div>

    <div id="container">
        <!-- Left Half with resizable divider -->
        <div id="left-half" >
            <!-- HTML Editor -->
            <div id="q1" style="padding-left:0; padding-right:0; padding-top: 0; padding-bottom:0;">
                <div id="editor-container" style="width:100%; height:100%;">
                    <!-- Add specific height and width for the editor -->
                     <div id="html-editor-sub">Template Editor</div>
                    <div id="html-editor" ></div>
                </div>
            </div>
    
            <!-- Divider for resizing -->
            <div class="divider" id="divider-left"></div>
    
            <!-- JSON Editor -->
            <div id="q2" style="padding-left:0; padding-right:0; padding-top: 0; padding-bottom:0; ">
                <div id="json-editor-container" style="width:100%; height:100%;">
                    <div id="json-editor-sub">Data Editor</div>
                    <div id="json-editor"></div>
                </div>
            </div>
        </div>

        <!-- Right Half with resizable divider -->
        <div id="right-half">


                        <!-- Preview -->
            <div id="q3" style="padding-left:0; padding-right:0; padding-top: 0; padding-bottom:0;">
                


            <div id="preview" style="width:100%; height:100%; position: relative;">
                <iframe id="rendered-image" src="" frameborder="0" scrolling="yes"></iframe>
                <div id="zoom-controls" style="position: absolute; bottom: 10px; left: 10px; z-index: 10;">
                    <button id="zoom-in">+</button>
                    <button id="zoom-out">-</button>
                </div>
            </div>



            </div>


            <div class="divider" id="divider-right"></div>


            <!-- Tabbed Section for Template Management and Log -->
            <div class="q4" style="padding-left:0; padding-right:0; padding-top: 0; padding-bottom:0;">

                <div class="tabbed-section" id="controls">
                    <div class="tabs">
                        <button class="button" id="create-tab"    onclick="showTab('create-tab', 'create-content')">Create</button>
                        <button class="button" id="images-tab"    onclick="showTab('images-tab', 'images-content')">Images</button>
                        <button class="button" id="templates-tab" onclick="showTab('templates-tab', 'templates-content')">Templates</button>
                        <button class="button" id="log-tab"       onclick="showTab('log-tab', 'log-content')">Log</button>
                    </div>
    
                    <!-- TAB - CREATE IMAGE -->
                    <div id="create-content" class="tab-content active">
                        <h2>Create Image</h2>
                        <button onclick="createNewTemplate()">Create New Template</button>
                        <label for="template-list">Load Template:</label>
                        <select id="template-list"></select>
                        <label for="template-name">Template Name:</label>
                        <input type="text" id="template-name" value="">
                        <button id="save-template">Save Template</button>
                        <h3>Dimensions</h3>
                        <label for="width">Width (px):</label>
                        <input type="number" id="width" value="800">
                        <label for="height">Height (px):</label>
                        <input type="number" id="height" value="600">
                        <h3>Actions</h3>
                        <button id="download-image">Download Image</button>
                        <label for="API_KEY">API key: <?php echo getenv('API_KEY'); ?></label>
                    </div>
    
                    <!-- TAB - LIST IMAGES -->
                    <div id="images-content" class="tab-content">
                        <!-- Buttons for image actions -->
                        <div id="image-controls" style="display: flex; width: 100%;">
                            <button id="delete-image" style="flex: 1;">Delete Selected</button>
                            <button id="delete-all-images" style="flex: 1;">Delete All</button>
                            <button id="download-image" style="flex: 1;">Download Selected</button>
                        </div>
    
                        <!-- Image preview and list box -->
                        <div style="display: flex; width: 100%; margin-top: 10px;">

                            <!-- Preview box -->
                         
                            <div id="image-preview-container" style="flex: 1; ">
                                <img id="image-preview" src="" alt="Image Preview" style="width: 100%; display: none;"/>
                            </div>
                            
                            <!-- List box for images -->
                            <div id="image-list-container" style="flex: 2; ">
                                <select id="image-list" size="10" style="width: 100%; height: 100%;"></select>
                            </div>
                        </div>
                    </div>
    
                    <!-- TAB - LIST TEMPLATES -->
                    <div id="templates-content" class="tab-content" style="display: none;">
                        <h2>Templates</h2>
                        <div id="template-list-container">
                            <select id="template-list" size="10" style="width: 100%;">
                                <!-- PHP code to list templates will go here -->
                                <?php
                                $templateDir = '/app/api/templates'; // Adjust the path accordingly
                                $templates = array_diff(scandir($templateDir), array('..', '.'));
                                foreach ($templates as $template) {
                                    echo '<option value="' . $template . '">' . $template . '</option>';
                                }
                                ?>
                            </select>
                        </div>
                        <div id="template-buttons">
                            <input type="file" id="upload-template" accept=".tpl">
                            <button onclick="uploadTemplate()">Upload Template</button>
                            <button onclick="downloadTemplate()">Download Template</button> <!-- New download button -->
                        </div>
    
                    </div>
    
                    <!-- TAB - LOGS -->
                    <div id="log-content" class="tab-content" style="display: none;">
                        <h2>Logs</h2>
                        <textarea id="log-output" readonly style="width: 100%; height: 100%;"></textarea>
                    </div>
                </div>


            </div>



        </div>
    </div>

    <!-- Ace Editor CDN without integrity and crossorigin -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.12/ace.js"></script>
    <!-- Link to the JavaScript file -->
  
    
    <script src="scripts/window.js"></script>
   
    <script src="scripts/scripts.js"></script>


</body>
</html>
