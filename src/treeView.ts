/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from 'vscode';
import { TreeItem, TreeItemType } from './treeItem';
import { TreeDataProvider } from './treeDataProvider';
import * as ui from './ui';
import { Clipboard } from 'ts-clipboard';

export class TreeView {

	public static currentPanel: TreeView | undefined;
	view: vscode.TreeView<TreeItem>;
	treeDataProvider: TreeDataProvider;
	context: vscode.ExtensionContext;
	filterString: string = '';

	constructor(context: vscode.ExtensionContext) {
		ui.logToOutput('TreeView.constructor Started');
		this.context = context;
		this.treeDataProvider = new TreeDataProvider();
		this.view = vscode.window.createTreeView('TreeView', { treeDataProvider: this.treeDataProvider, showCollapseAll: true });
		context.subscriptions.push(this.view);
		TreeView.currentPanel = this;
	}


	async refresh() {
		ui.logToOutput('TreeView.refresh Started');
		this.treeDataProvider.refresh();
	}

	async addToFav(node: TreeItem) {
		ui.logToOutput('TreeView.addToFavDAG Started');
		node.isFav = true;
	}

	async deleteFromFav(node: TreeItem) {
		ui.logToOutput('TreeView.deleteFromFavDAG Started');
		node.isFav = false;
	}

	async copyToClipboard(node: TreeItem) {
		ui.logToOutput('TreeView.copyToClipboard Started');

		if (node.TreeItemType === TreeItemType.Key) {
			vscode.env.clipboard.writeText(node.Key);
		}

		if (node.TreeItemType === TreeItemType.Value) {
			vscode.env.clipboard.writeText(node.Value);
		}
	}

	async filter() {
		ui.logToOutput('TreeView.filter Started');
		let filterStringTemp = await vscode.window.showInputBox({ value: this.filterString, placeHolder: 'Enter your filters seperated by comma' });

		if (filterStringTemp === undefined) { return; }

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

	async editNode(node: TreeItem) {
		ui.logToOutput('TreeView.editNode Started');
		if(node.TreeItemType !== TreeItemType.Key){
			return;
		}

		try 
		{
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

		} catch (error) {
			ui.logToOutput('TreeView.editNode Error: ' + error.message);
		}
	}
	
	async addNode(node: TreeItem) {
		ui.logToOutput('TreeView.addNode Started');

		try 
		{
			const newEnvVariableName = await vscode.window.showInputBox({placeHolder: 'Enter New Environment Variable Name' });
			if (newEnvVariableName !== undefined && newEnvVariableName.trim() !== '') {
				if (process.env.hasOwnProperty(newEnvVariableName)) {
					ui.showErrorMessage(`Environment variable "${newEnvVariableName}" already exists.`);
					ui.logToOutput(`Environment variable "${newEnvVariableName}" already exists.`);
					return;
				}
				const newValue = await vscode.window.showInputBox({placeHolder: 'Enter New Environment Variable Value' });
				process.env[newEnvVariableName] = newValue || '';
				this.treeDataProvider.refresh();
				ui.showInfoMessage(`Environment variable "${newEnvVariableName}" has been added.`);
				ui.logToOutput(`Environment variable "${newEnvVariableName}" has been added.`);
			}

		} catch (error) {
			ui.logToOutput('TreeView.addNode Error: ' + error.message);
		}
	}

	async searchGoogle(node: TreeItem) {
		ui.logToOutput('TreeView.searchGoogle Started');
		if(node.TreeItemType !== TreeItemType.Key){
			return;
		}

		try 
		{
			const platformName = ui.getPlatformName();
			ui.logToOutput(`Platform detected: ${platformName}`);
			const searchQuery = `${platformName} environment variable ${node.Key}`;
			const query = encodeURIComponent(searchQuery);
			const url = `https://www.google.com/search?q=${query}`;
			vscode.env.openExternal(vscode.Uri.parse(url));
			ui.logToOutput(`Opened Google search for "${searchQuery}".`);

		} catch (error) {
			ui.logToOutput('TreeView.searchGoogle Error: ' + error.message);
			ui.showErrorMessage('Failed to open Google search: ' + error.message);
		}
	}
	
	async removeNode(node: TreeItem) {
		ui.logToOutput('TreeView.removeNode Started');
		if(node.TreeItemType !== TreeItemType.Key){
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
			} catch (error) {
				ui.showErrorMessage(`Failed to remove environment variable "${node.Key}": ${error.message}`);
				ui.logToOutput(`Failed to remove environment variable "${node.Key}": ${error.message}`);
			}
		}
	}

}

