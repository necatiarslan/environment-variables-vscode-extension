/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from 'vscode';
import { TreeItem, TreeItemType } from './treeItem';
import { env } from 'node:process';
import * as ui from './ui';

export class TreeDataProvider implements vscode.TreeDataProvider<TreeItem>
{
	private _onDidChangeTreeData: vscode.EventEmitter<TreeItem | undefined | void> = new vscode.EventEmitter<TreeItem | undefined | void>();
	readonly onDidChangeTreeData: vscode.Event<TreeItem | undefined | void> = this._onDidChangeTreeData.event;

	filterString: string = '';
	itemList: TreeItem[] = [];
	visibleItemList: TreeItem[] = [];
	envVaribleSeperator: string = ';';

	constructor() {
		this.loadTreeItems();
		this.envVaribleSeperator = ui.getEnvVarSeperator();
	}

	refresh(): void {
		this.loadTreeItems();
		this._onDidChangeTreeData.fire();
	}

	loadTreeItems() {
		this.itemList = [];
		for (var key of Object.keys(env)) {
			let treeItem = new TreeItem(key, key, env[key], TreeItemType.Key);
			treeItem.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
			this.itemList.push(treeItem);
		}
	}

	getChildren(element: TreeItem): Thenable<TreeItem[]> {
		if (!element) {
			this.visibleItemList = [];
			for (var node of this.itemList) {
				if (!this.filterString || (this.filterString && node.doesFilterMatch(this.filterString))) {
					this.visibleItemList.push(node);
				}
			}
			return Promise.resolve(this.visibleItemList);
		}
		else if (element.TreeItemType === TreeItemType.Key) {
			let values: string[] = element.Value.split(this.envVaribleSeperator);
			
			let valueTreeItemList = [];
			for (var i in values) {
				let treeItem = new TreeItem(values[i], element.Key, values[i], TreeItemType.Value);
				treeItem.ParentTreeItem = element;
				element.ChildTreeItemList.push(treeItem);
				valueTreeItemList.push(treeItem);
			}
			return Promise.resolve(valueTreeItemList);
		}
		return Promise.resolve([]);
	}

	getTreeItem(element: TreeItem): TreeItem {
		return element;
	}
}