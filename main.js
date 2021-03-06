/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50, regexp: true */
/*global define, brackets, $, window */

define(function (require, exports, module) {
    "use strict";

    var AppInit             = brackets.getModule("utils/AppInit"),
        CodeHintManager     = brackets.getModule("editor/CodeHintManager");
    
    var moodlejson = require('text!moodleapi.json');
    
    var moodleapi = JSON.parse(moodlejson);
    
    var lastLine,
        tokenDefinition,
        currentTokenDefinition;
    
    /**
     * @constructor
     */
    function MoodleApiHint() {
        this.lastLine = 0;
        this.tokenDefinition = /[a-zA-Z][a-zA-Z0-9_]{2,}/g;
        this.currentTokenDefinition = /[a-zA-Z][a-zA-Z0-9_]+$/g;
    }
    
    
    /**
     * 
     * @param {Editor} editor 
     * A non-null editor object for the active window.
     *
     * @param {String} implicitChar 
     * Either null, if the hinting request was explicit, or a single character
     * that represents the last insertion and that indicates an implicit
     * hinting request.
     *
     * @return {Boolean} 
     * Determines whether the current provider is able to provide hints for
     * the given editor context and, in case implicitChar is non- null,
     * whether it is appropriate to do so.
     */
    MoodleApiHint.prototype.hasHints = function (editor, implicitChar) {
        this.editor = editor;
        var cursor = this.editor.getCursorPos();
        
        this.lastLine = cursor.line;
        
        // if has entered more than 2 characters - start completion
        var lineBeginning = {line:cursor.line,ch:0};
        var textBeforeCursor = this.editor.document.getRange(lineBeginning, cursor);
        var symbolBeforeCursorArray = textBeforeCursor.match(this.currentTokenDefinition);
        if(symbolBeforeCursorArray){
            // find if the half-word inputed is in the list
            for(var j in moodleapi['functions']){
                if(moodleapi['functions'][j]['label'].indexOf(symbolBeforeCursorArray[0])===0){
                    return true;  
                }
            }
        }
        
        
        return false;
    };
       
    /**
     * 
     * @param {Editor} implicitChar 
     * Either null, if the hinting request was explicit, or a single character
     * that represents the last insertion and that indicates an implicit
     * hinting request.
     *
     * @return {jQuery.Deferred|{
     *              hints: Array.<string|jQueryObject>,
     *              match: string,
     *              selectInitial: boolean,
     *              handleWideResults: boolean}}
     * Null if the provider wishes to end the hinting session. Otherwise, a
     * response object that provides:
     * 1. a sorted array hints that consists of strings
     * 2. a string match that is used by the manager to emphasize matching
     *    substrings when rendering the hint list
     * 3. a boolean that indicates whether the first result, if one exists,
     *    should be selected by default in the hint list window.
     * 4. handleWideResults, a boolean (or undefined) that indicates whether
     *    to allow result string to stretch width of display.
     */
    MoodleApiHint.prototype.getHints = function (implicitChar) {
        var cursor = this.editor.getCursorPos();
        var lineBeginning = {line:cursor.line,ch:0};
        var textBeforeCursor = this.editor.document.getRange(lineBeginning, cursor);
        var symbolBeforeCursorArray = textBeforeCursor.match(this.currentTokenDefinition);
        var hintList = [];
        for(var i in moodleapi['functions']){
            if(moodleapi['functions'][i]['label'].indexOf(symbolBeforeCursorArray[0])===0){
                hintList.push(moodleapi['functions'][i]['label']);
            }
        }

        return {
            hints: hintList,
            match: symbolBeforeCursorArray[0],
            selectInitial: true,
            handleWideResults: false
        };
    };
    
    /**
     * Complete the word
     * 
     * @param {String} hint 
     * The hint to be inserted into the editor context.
     * 
     * @return {Boolean} 
     * Indicates whether the manager should follow hint insertion with an
     * additional explicit hint request.
     */
    MoodleApiHint.prototype.insertHint = function (hint) {
        console.log(hint);
        var cursor = this.editor.getCursorPos();
        var lineBeginning = {line:cursor.line,ch:0};
        var textBeforeCursor = this.editor.document.getRange(lineBeginning, cursor);
        var indexOfTheSymbol = textBeforeCursor.search(this.currentTokenDefinition);
        var replaceStart = {line:cursor.line,ch:indexOfTheSymbol};
        for(var k in moodleapi['functions']){
            if(moodleapi['functions'][k]['label'] == hint){
                this.editor.document.replaceRange(moodleapi['functions'][k]['value'], replaceStart, cursor);
            }
        }
        
        
        return false;
    };
    
    AppInit.appReady(function () {
        var moodlehints = new MoodleApiHint();
        CodeHintManager.registerHintProvider(moodlehints, ["php"], 0);
    });
});
