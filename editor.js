var jsonEditor; // Declare globally
var editor;     // Declare globally

window.onload = function() {
    // Initialize HTML editor
    editor = ace.edit("html-editor");
    editor.setTheme("ace/theme/clouds_midnight");
    editor.session.setMode("ace/mode/html");
    editor.setShowPrintMargin(false);

    // Initialize JSON editor
    jsonEditor = ace.edit("json-editor");
    jsonEditor.setTheme("ace/theme/clouds_midnight");
    jsonEditor.session.setMode("ace/mode/json");
    jsonEditor.setShowPrintMargin(false);
};
