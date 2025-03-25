/**
 * editor.js - Modifies Ace Editor tokenization for template variables in CSS
 */

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(fixCssTokenization, 500);
});

function fixCssTokenization() {
    if (!window.templateEditor) return;
    
    try {
        // Get the HTML mode
        const htmlMode = window.templateEditor.session.getMode();
        
        // Find the CSS mode embedded in the HTML mode
        let cssMode = null;
        if (htmlMode.$embeds && htmlMode.$modes) {
            for (const key in htmlMode.$modes) {
                if (key.indexOf('css') !== -1) {
                    cssMode = htmlMode.$modes[key];
                    break;
                }
            }
        }
        
        if (!cssMode) {
            console.error("Could not find CSS mode embedded in HTML mode");
            return;
        }
        
        // Get CSS rule set
        const cssRuleSet = cssMode.$highlightRules;
        if (!cssRuleSet || !cssRuleSet.$rules) {
            console.error("Could not access CSS highlight rules");
            return;
        }
        
        // Modify the CSS rules to better handle template variables
        for (const state in cssRuleSet.$rules) {
            const rules = cssRuleSet.$rules[state];
            
            // Find rules that transition to different states based on punctuation
            for (let i = 0; i < rules.length; i++) {
                const rule = rules[i];
                
                // These are typically the rules that handle property values
                if (rule.token === "value") {
                    // This is where we need to modify the regex to accommodate template variables
                    const originalRegex = rule.regex;
                    
                    if (typeof originalRegex === 'string') {
                        // Convert regex string to actual RegExp object if needed
                        rule.regex = new RegExp(originalRegex);
                    }
                    
                    // Some rules determine when a CSS property value ends
                    // We need to modify these to prevent template variables from breaking tokenization
                    if (rule.next && (rule.next === "pop" || rule.next.indexOf("ruleset") !== -1)) {
                        // Original rule stays as is - we'll add a template var rule before it
                        
                        // Add a new rule to handle template variables
                        rules.splice(i, 0, {
                            token: "variable.template",
                            regex: /{{[a-zA-Z0-9_]+}}/,
                            // Don't transition state when encountering template variable
                            next: state
                        });
                        
                        // Skip the rule we just added
                        i++;
                    }
                }
            }
            
            // Add a rule at the start to catch template variables in any context
            rules.unshift({
                token: "variable.template",
                regex: /{{[a-zA-Z0-9_]+}}/
            });
        }
        
        // Force re-tokenization
        window.templateEditor.session.bgTokenizer.start(0);
        
        // Add CSS styling for template variables
        const style = document.createElement('style');
        style.textContent = `
            .ace_variable.ace_template {
                color: #ffcc00 !important;
                font-weight: bold;
            }
        `;
        document.head.appendChild(style);
        
        console.log("Successfully modified CSS tokenization rules for template variables");
    } catch (e) {
        console.error("Error modifying CSS tokenization:", e);
    }
}