/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from 'vscode';

export class TreeItem extends vscode.TreeItem {
	public isFav: boolean = false;

	public Key: string;
	public Value: string;
	public TreeItemType: TreeItemType;

	public ParentTreeItem: TreeItem;
	public ChildTreeItemList: TreeItem[] = [];

	constructor(label: string, key: string, value: string, treeItemType: TreeItemType) {
		super(label);
		this.Key = key;
		this.Value = value;
		this.TreeItemType = treeItemType;
		this.refreshUI();
	}

	public refreshUI() {
		if(this.TreeItemType === TreeItemType.Key)
		{
			this.iconPath = new vscode.ThemeIcon('circle-filled');
		}
		if(this.TreeItemType === TreeItemType.Value)
		{
			this.iconPath = new vscode.ThemeIcon('circle-outline');
		}
	}

	public doesFilterMatch(filterString: string): boolean {
		let words: string[] = filterString.toLocaleLowerCase().split(',');
		let matchingWords: string[] = [];
		for (var word of words) {
			if (this.Key.toLocaleLowerCase().includes(word)) { matchingWords.push(word); continue; }
			if (this.Value.toLocaleLowerCase().includes(word)) { matchingWords.push(word); continue; }
			if (word === 'fav' && this.isFav) { matchingWords.push(word); continue; }
		}

		return words.length === matchingWords.length;
	}
}

export enum TreeItemType {
	Key = 1,
	Value = 2
}