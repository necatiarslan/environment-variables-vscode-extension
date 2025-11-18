/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((module) => {

module.exports = require("vscode");

/***/ }),
/* 2 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TreeView = void 0;
/* eslint-disable @typescript-eslint/naming-convention */
const vscode = __webpack_require__(1);
const treeItem_1 = __webpack_require__(3);
const treeDataProvider_1 = __webpack_require__(4);
const ui = __webpack_require__(6);
class TreeView {
    constructor(context) {
        this.filterString = '';
        ui.logToOutput('TreeView.constructor Started');
        this.context = context;
        this.treeDataProvider = new treeDataProvider_1.TreeDataProvider();
        this.view = vscode.window.createTreeView('TreeView', { treeDataProvider: this.treeDataProvider, showCollapseAll: true });
        context.subscriptions.push(this.view);
        TreeView.currentPanel = this;
    }
    async refresh() {
        ui.logToOutput('TreeView.refresh Started');
        this.treeDataProvider.refresh();
    }
    async addToFav(node) {
        ui.logToOutput('TreeView.addToFavDAG Started');
        node.isFav = true;
    }
    async deleteFromFav(node) {
        ui.logToOutput('TreeView.deleteFromFavDAG Started');
        node.isFav = false;
    }
    async copyToClipboard(node) {
        ui.logToOutput('TreeView.copyToClipboard Started');
        if (node.TreeItemType === treeItem_1.TreeItemType.Key) {
            vscode.env.clipboard.writeText(node.Key);
        }
        if (node.TreeItemType === treeItem_1.TreeItemType.Value) {
            vscode.env.clipboard.writeText(node.Value);
        }
    }
    async filter() {
        ui.logToOutput('TreeView.filter Started');
        let filterStringTemp = await vscode.window.showInputBox({ value: this.filterString, placeHolder: 'Enter your filters seperated by comma' });
        if (filterStringTemp === undefined) {
            return;
        }
        if (filterStringTemp !== '') {
            this.filterString = filterStringTemp;
            this.view.message = 'Filter : ' + this.filterString;
            this.treeDataProvider.filterString = this.filterString;
        }
        else {
            this.filterString = '';
            this.view.message = '';
            this.treeDataProvider.filterString = this.filterString;
        }
        this.treeDataProvider.refresh();
    }
    async editNode(node) {
        ui.logToOutput('TreeView.editNode Started');
        if (node.TreeItemType !== treeItem_1.TreeItemType.Key) {
            return;
        }
        try {
            const currentValue = process.env[node.Key] || '';
            const newValue = await vscode.window.showInputBox({ value: currentValue, placeHolder: 'Enter new value' });
            if (currentValue === newValue) {
                ui.logToOutput(`Environment variable "${node.Key}" has not been changed.`);
                ui.showInfoMessage(`Environment variable "${node.Key}" has not been changed.`);
                return;
            }
            if (newValue !== undefined) {
                process.env[node.Key] = newValue;
                this.treeDataProvider.refresh();
                ui.showInfoMessage(`Environment variable "${node.Key}" has been updated.`);
                ui.logToOutput(`Environment variable "${node.Key}" has been updated.`);
            }
        }
        catch (error) {
            ui.logToOutput('TreeView.editNode Error: ' + error.message);
        }
    }
    async addNode(node) {
        ui.logToOutput('TreeView.addNode Started');
        try {
            const newEnvVariableName = await vscode.window.showInputBox({ placeHolder: 'Enter New Environment Variable Name' });
            if (newEnvVariableName !== undefined && newEnvVariableName.trim() !== '') {
                if (process.env.hasOwnProperty(newEnvVariableName)) {
                    ui.showErrorMessage(`Environment variable "${newEnvVariableName}" already exists.`);
                    ui.logToOutput(`Environment variable "${newEnvVariableName}" already exists.`);
                    return;
                }
                const newValue = await vscode.window.showInputBox({ placeHolder: 'Enter New Environment Variable Value' });
                process.env[newEnvVariableName] = newValue || '';
                this.treeDataProvider.refresh();
                ui.showInfoMessage(`Environment variable "${newEnvVariableName}" has been added.`);
                ui.logToOutput(`Environment variable "${newEnvVariableName}" has been added.`);
            }
        }
        catch (error) {
            ui.logToOutput('TreeView.addNode Error: ' + error.message);
        }
    }
    async searchGoogle(node) {
        ui.logToOutput('TreeView.searchGoogle Started');
        if (node.TreeItemType !== treeItem_1.TreeItemType.Key) {
            return;
        }
        try {
            const platformName = ui.getPlatformName();
            ui.logToOutput(`Platform detected: ${platformName}`);
            const searchQuery = `${platformName} environment variable ${node.Key}`;
            const query = encodeURIComponent(searchQuery);
            const url = `https://www.google.com/search?q=${query}`;
            vscode.env.openExternal(vscode.Uri.parse(url));
            ui.logToOutput(`Opened Google search for "${searchQuery}".`);
        }
        catch (error) {
            ui.logToOutput('TreeView.searchGoogle Error: ' + error.message);
            ui.showErrorMessage('Failed to open Google search: ' + error.message);
        }
    }
    async removeNode(node) {
        ui.logToOutput('TreeView.removeNode Started');
        if (node.TreeItemType !== treeItem_1.TreeItemType.Key) {
            return;
        }
        const confirmation = 'Are you sure you want to remove the environment variable "' + node.Key + '"? This action cannot be undone.';
        const response = await vscode.window.showWarningMessage(confirmation, { modal: true }, 'Yes', 'No');
        if (response === 'Yes') {
            try {
                // Remove the environment variable
                delete process.env[node.Key];
                // Refresh the tree view to reflect the changes
                this.treeDataProvider.refresh();
                ui.showInfoMessage(`Environment variable "${node.Key}" has been removed.`);
                ui.logToOutput(`Environment variable "${node.Key}" has been removed.`);
            }
            catch (error) {
                ui.showErrorMessage(`Failed to remove environment variable "${node.Key}": ${error.message}`);
                ui.logToOutput(`Failed to remove environment variable "${node.Key}": ${error.message}`);
            }
        }
    }
}
exports.TreeView = TreeView;


/***/ }),
/* 3 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TreeItemType = exports.TreeItem = void 0;
/* eslint-disable @typescript-eslint/naming-convention */
const vscode = __webpack_require__(1);
class TreeItem extends vscode.TreeItem {
    constructor(label, key, value, treeItemType) {
        super(label);
        this.isFav = false;
        this.ChildTreeItemList = [];
        this.Key = key;
        this.Value = value;
        this.TreeItemType = treeItemType;
        this.refreshUI();
    }
    refreshUI() {
        if (this.TreeItemType === TreeItemType.Key) {
            this.iconPath = new vscode.ThemeIcon('circle-filled');
        }
        if (this.TreeItemType === TreeItemType.Value) {
            this.iconPath = new vscode.ThemeIcon('circle-outline');
        }
    }
    doesFilterMatch(filterString) {
        let words = filterString.toLocaleLowerCase().split(',');
        let matchingWords = [];
        for (var word of words) {
            if (this.Key.toLocaleLowerCase().includes(word)) {
                matchingWords.push(word);
                continue;
            }
            if (this.Value.toLocaleLowerCase().includes(word)) {
                matchingWords.push(word);
                continue;
            }
            if (word === 'fav' && this.isFav) {
                matchingWords.push(word);
                continue;
            }
        }
        return words.length === matchingWords.length;
    }
}
exports.TreeItem = TreeItem;
var TreeItemType;
(function (TreeItemType) {
    TreeItemType[TreeItemType["Key"] = 1] = "Key";
    TreeItemType[TreeItemType["Value"] = 2] = "Value";
})(TreeItemType = exports.TreeItemType || (exports.TreeItemType = {}));


/***/ }),
/* 4 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TreeDataProvider = void 0;
/* eslint-disable @typescript-eslint/naming-convention */
const vscode = __webpack_require__(1);
const treeItem_1 = __webpack_require__(3);
const node_process_1 = __webpack_require__(5);
const ui = __webpack_require__(6);
class TreeDataProvider {
    constructor() {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.filterString = '';
        this.itemList = [];
        this.visibleItemList = [];
        this.envVaribleSeperator = ';';
        this.loadTreeItems();
        this.envVaribleSeperator = ui.getEnvVarSeperator();
    }
    refresh() {
        this.loadTreeItems();
        this._onDidChangeTreeData.fire();
    }
    loadTreeItems() {
        this.itemList = [];
        for (var key of Object.keys(node_process_1.env)) {
            let treeItem = new treeItem_1.TreeItem(key, key, node_process_1.env[key], treeItem_1.TreeItemType.Key);
            treeItem.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
            this.itemList.push(treeItem);
        }
    }
    getChildren(element) {
        if (!element) {
            this.visibleItemList = [];
            for (var node of this.itemList) {
                if (!this.filterString || (this.filterString && node.doesFilterMatch(this.filterString))) {
                    this.visibleItemList.push(node);
                }
            }
            return Promise.resolve(this.visibleItemList);
        }
        else if (element.TreeItemType === treeItem_1.TreeItemType.Key) {
            let values = element.Value.split(this.envVaribleSeperator);
            let valueTreeItemList = [];
            for (var i in values) {
                let treeItem = new treeItem_1.TreeItem(values[i], element.Key, values[i], treeItem_1.TreeItemType.Value);
                treeItem.ParentTreeItem = element;
                element.ChildTreeItemList.push(treeItem);
                valueTreeItemList.push(treeItem);
            }
            return Promise.resolve(valueTreeItemList);
        }
        return Promise.resolve([]);
    }
    getTreeItem(element) {
        return element;
    }
}
exports.TreeDataProvider = TreeDataProvider;


/***/ }),
/* 5 */
/***/ ((module) => {

module.exports = require("node:process");

/***/ }),
/* 6 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getPlatformName = exports.getEnvVarSeperator = exports.isValidDate = exports.isJsonString = exports.convertMsToTime = exports.getDuration = exports.openFile = exports.getExtensionVersion = exports.showApiErrorMessage = exports.showErrorMessage = exports.showWarningMessage = exports.showInfoMessage = exports.logToOutput = exports.showOutputMessage = void 0;
const vscode = __webpack_require__(1);
const fs_1 = __webpack_require__(7);
const path_1 = __webpack_require__(8);
const os = __webpack_require__(9);
var outputChannel;
var logsOutputChannel;
function showOutputMessage(message) {
    if (!outputChannel) {
        outputChannel = vscode.window.createOutputChannel("Environment-Variables-Extension");
    }
    outputChannel.clear();
    if (typeof message === "object") {
        outputChannel.appendLine(JSON.stringify(message, null, 4));
    }
    else {
        outputChannel.appendLine(message);
    }
    outputChannel.show();
    showInfoMessage("Results are printed to OUTPUT / Environment-Variables-Extension");
}
exports.showOutputMessage = showOutputMessage;
function logToOutput(message, error = undefined) {
    let now = new Date().toLocaleString();
    if (!logsOutputChannel) {
        logsOutputChannel = vscode.window.createOutputChannel("Environment-Variables-Log");
    }
    if (typeof message === "object") {
        logsOutputChannel.appendLine("[" + now + "] " + JSON.stringify(message, null, 4));
    }
    else {
        logsOutputChannel.appendLine("[" + now + "] " + message);
    }
    if (error) {
        logsOutputChannel.appendLine(error.name);
        logsOutputChannel.appendLine(error.message);
        logsOutputChannel.appendLine(error.stack);
    }
}
exports.logToOutput = logToOutput;
function showInfoMessage(message) {
    vscode.window.showInformationMessage(message);
}
exports.showInfoMessage = showInfoMessage;
function showWarningMessage(message) {
    vscode.window.showWarningMessage(message);
}
exports.showWarningMessage = showWarningMessage;
function showErrorMessage(message, error = undefined) {
    if (error) {
        vscode.window.showErrorMessage(message + "\n\n" + error.name + "/n" + error.message);
    }
    else {
        vscode.window.showErrorMessage(message);
    }
}
exports.showErrorMessage = showErrorMessage;
function showApiErrorMessage(message, jsonResult) {
    if (jsonResult) {
        vscode.window.showErrorMessage(message + "\n\n"
            + "type:" + jsonResult.type + "\n"
            + "title:" + jsonResult.title + "\n"
            + "status:" + jsonResult.status + "\n"
            + "detail:" + jsonResult.detail + "\n"
            + "instance:" + jsonResult.instance + "\n");
    }
    else {
        vscode.window.showErrorMessage(message);
    }
    /*
    {
    "type": "string",
    "title": "string",
    "status": 0,
    "detail": "string",
    "instance": "string"
    }
    */
}
exports.showApiErrorMessage = showApiErrorMessage;
function getExtensionVersion() {
    const { version: extVersion } = JSON.parse((0, fs_1.readFileSync)((0, path_1.join)(__dirname, '..', 'package.json'), { encoding: 'utf8' }));
    return extVersion;
}
exports.getExtensionVersion = getExtensionVersion;
function openFile(file) {
    vscode.commands.executeCommand('vscode.open', vscode.Uri.file(file), vscode.ViewColumn.One);
    //vscode.workspace.openTextDocument(vscode.Uri.file(file));
}
exports.openFile = openFile;
function padTo2Digits(num) {
    return num.toString().padStart(2, '0');
}
function getDuration(startDate, endDate) {
    if (!startDate) {
        return "";
    }
    if (!endDate || endDate < startDate) {
        endDate = new Date(); //now
    }
    var duration = endDate.valueOf() - startDate.valueOf();
    return (convertMsToTime(duration));
}
exports.getDuration = getDuration;
function convertMsToTime(milliseconds) {
    let seconds = Math.floor(milliseconds / 1000);
    let minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    seconds = seconds % 60;
    minutes = minutes % 60;
    return `${padTo2Digits(hours)}:${padTo2Digits(minutes)}:${padTo2Digits(seconds)}`;
}
exports.convertMsToTime = convertMsToTime;
function isJsonString(jsonString) {
    try {
        var json = JSON.parse(jsonString);
        return (typeof json === 'object');
    }
    catch (e) {
        return false;
    }
}
exports.isJsonString = isJsonString;
function isValidDate(dateString) {
    var regEx = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateString.match(regEx)) {
        return false; // Invalid format
    }
    var d = new Date(dateString);
    var dNum = d.getTime();
    if (!dNum && dNum !== 0) {
        return false; // NaN value, Invalid date
    }
    return d.toISOString().slice(0, 10) === dateString;
}
exports.isValidDate = isValidDate;
function getEnvVarSeperator() {
    if (os.platform().includes('win32')) {
        return ';';
    }
    if (os.platform().includes('darwin')) {
        return ':';
    }
    if (os.platform().includes('linux')) {
        return ':';
    }
    return ":";
}
exports.getEnvVarSeperator = getEnvVarSeperator;
function getPlatformName() {
    if (os.platform().includes('win32')) {
        return 'Windows';
    }
    if (os.platform().includes('darwin')) {
        return 'macOS';
    }
    if (os.platform().includes('linux')) {
        return 'Linux';
    }
    return 'macOS';
}
exports.getPlatformName = getPlatformName;


/***/ }),
/* 7 */
/***/ ((module) => {

module.exports = require("fs");

/***/ }),
/* 8 */
/***/ ((module) => {

module.exports = require("path");

/***/ }),
/* 9 */
/***/ ((module) => {

module.exports = require("os");

/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.deactivate = exports.activate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = __webpack_require__(1);
const treeView_1 = __webpack_require__(2);
const ui = __webpack_require__(6);
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    ui.logToOutput('Extension activation started');
    let treeView = new treeView_1.TreeView(context);
    vscode.commands.registerCommand('TreeView.refresh', () => {
        treeView.refresh();
    });
    vscode.commands.registerCommand('TreeView.filter', () => {
        treeView.filter();
    });
    vscode.commands.registerCommand('TreeView.addToFav', (node) => {
        treeView.addToFav(node);
    });
    vscode.commands.registerCommand('TreeView.deleteFromFav', (node) => {
        treeView.deleteFromFav(node);
    });
    vscode.commands.registerCommand('TreeView.copy', (node) => {
        treeView.copyToClipboard(node);
    });
    vscode.commands.registerCommand('TreeView.edit', (node) => {
        treeView.editNode(node);
    });
    vscode.commands.registerCommand('TreeView.add', (node) => {
        treeView.addNode(node);
    });
    vscode.commands.registerCommand('TreeView.searchGoogle', (node) => {
        treeView.searchGoogle(node);
    });
    vscode.commands.registerCommand('TreeView.remove', (node) => {
        treeView.removeNode(node);
    });
    ui.logToOutput('Extension activation completed');
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
    ui.logToOutput('Extension is now deactive!');
}
exports.deactivate = deactivate;

})();

module.exports = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=extension.js.map