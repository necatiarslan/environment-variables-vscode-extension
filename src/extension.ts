// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { TreeView } from './treeView';
import { TreeItem } from './treeItem';
import * as ui from './ui';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	ui.logToOutput('Extension activation started');

	let treeView:TreeView = new TreeView(context);

	vscode.commands.registerCommand('TreeView.refresh', () => {
		treeView.refresh();
	});

	vscode.commands.registerCommand('TreeView.filter', () => {
		treeView.filter();
	});

	vscode.commands.registerCommand('TreeView.addToFav', (node: TreeItem) => {
		treeView.addToFav(node);
	});

	vscode.commands.registerCommand('TreeView.deleteFromFav', (node: TreeItem) => {
		treeView.deleteFromFav(node);
	});

	vscode.commands.registerCommand('TreeView.copy', (node: TreeItem) => {
		treeView.copyToClipboard(node);
	});

	ui.logToOutput('Extension activation completed');
}

// this method is called when your extension is deactivated
export function deactivate() {
	ui.logToOutput('Extension is now deactive!');
}
