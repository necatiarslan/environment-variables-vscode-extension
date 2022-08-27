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
			//Clipboard.copy(node.Key);
		}

		if (node.TreeItemType === TreeItemType.Value) {
			//Clipboard.copy(node.Value);
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

}

