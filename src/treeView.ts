/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from 'vscode';
import { TreeItem, TreeItemType } from './treeItem';
import { TreeDataProvider } from './treeDataProvider';
import * as ui from './ui';
import { Clipboard } from 'ts-clipboard';
import * as yaml from 'js-yaml';

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

	async exportEnvironmentVariables() {
		ui.logToOutput('TreeView.exportEnvironmentVariables Started');

		try {
			// Get all environment variables
			const envVars = process.env;
			
			// Create YAML content with metadata
			const exportData = {
				metadata: {
					exportDate: new Date().toISOString(),
					platform: ui.getPlatformName(),
					version: '1.0'
				},
				environmentVariables: envVars
			};

			const yamlContent = yaml.dump(exportData, {
				indent: 2,
				lineWidth: -1,
				noRefs: true
			});

			// Show save dialog
			const uri = await vscode.window.showSaveDialog({
				defaultUri: vscode.Uri.file('environment-variables.yaml'),
				filters: {
					'YAML files': ['yaml', 'yml']
				},
				saveLabel: 'Export'
			});

			if (uri) {
				// Write to file
				const fs = require('fs');
				fs.writeFileSync(uri.fsPath, yamlContent, 'utf8');
				
				const varCount = Object.keys(envVars).length;
				ui.showInfoMessage(`Successfully exported ${varCount} environment variables to ${uri.fsPath}`);
				ui.logToOutput(`Exported ${varCount} environment variables to ${uri.fsPath}`);
			}

		} catch (error) {
			ui.logToOutput('TreeView.exportEnvironmentVariables Error: ' + error.message);
			ui.showErrorMessage('Failed to export environment variables: ' + error.message);
		}
	}

	async importEnvironmentVariables() {
		ui.logToOutput('TreeView.importEnvironmentVariables Started');

		try {
			// Show open dialog
			const uris = await vscode.window.showOpenDialog({
				canSelectMany: false,
				filters: {
					'YAML files': ['yaml', 'yml']
				},
				openLabel: 'Import'
			});

			if (!uris || uris.length === 0) {
				return;
			}

			const uri = uris[0];
			const fs = require('fs');
			const fileContent = fs.readFileSync(uri.fsPath, 'utf8');

			// Parse YAML
			let importData: any;
			try {
				importData = yaml.load(fileContent);
			} catch (yamlError) {
				ui.showErrorMessage('Invalid YAML file: ' + yamlError.message);
				ui.logToOutput('YAML parsing error: ' + yamlError.message);
				return;
			}

			// Validate the structure
			if (!importData || typeof importData !== 'object') {
				ui.showErrorMessage('Invalid environment variables file: Root must be an object');
				return;
			}

			// Check if it's our export format with metadata
			let envVarsToImport: any;
			if (importData.metadata && importData.environmentVariables) {
				envVarsToImport = importData.environmentVariables;
				ui.logToOutput(`Importing from file created on ${importData.metadata.exportDate || 'unknown date'}`);
			} else {
				// Assume the entire file is environment variables
				envVarsToImport = importData;
			}

			if (!envVarsToImport || typeof envVarsToImport !== 'object') {
				ui.showErrorMessage('Invalid environment variables file: No valid environment variables found');
				return;
			}

			// Import variables one by one
			let imported = 0;
			let skipped = 0;
			let unchanged = 0;
			let overwritten = 0;
			let failed = 0;
			const failedVars: string[] = [];

			const varNames = Object.keys(envVarsToImport);
			const totalVars = varNames.length;

			ui.logToOutput(`Found ${totalVars} environment variables to import`);

			for (const varName of varNames) {
				const newValue = envVarsToImport[varName];

				// Skip if value is not a string or number
				if (typeof newValue !== 'string' && typeof newValue !== 'number' && newValue !== null && newValue !== undefined) {
					ui.logToOutput(`Skipping ${varName}: Invalid value type (${typeof newValue})`);
					failed++;
					failedVars.push(varName);
					continue;
				}

				const valueStr = newValue === null || newValue === undefined ? '' : String(newValue);

				// Check if variable already exists
				if (process.env.hasOwnProperty(varName)) {
					const currentValue = process.env[varName];
					
					// Check if values are equal - auto-skip if they are
					if (currentValue === valueStr) {
						unchanged++;
						ui.logToOutput(`Unchanged variable (values are equal): ${varName}`);
						continue;
					}
					
					// Ask user what to do
					const response = await vscode.window.showWarningMessage(
						`Environment variable "${varName}" already exists.\n\nCurrent value: ${currentValue}\nNew value: ${valueStr}\n\nDo you want to overwrite it?`,
						{ modal: true },
						'Overwrite',
						'Skip',
						'Cancel Import'
					);

					if (response === 'Cancel Import') {
						ui.showInfoMessage(`Import cancelled. Imported: ${imported}, Overwritten: ${overwritten}, Skipped: ${skipped}, Unchanged: ${unchanged}`);
						ui.logToOutput(`Import cancelled by user at variable "${varName}"`);
						return;
					} else if (response === 'Skip') {
						skipped++;
						ui.logToOutput(`Skipped existing variable: ${varName}`);
						continue;
					} else if (response === 'Overwrite') {
						process.env[varName] = valueStr;
						overwritten++;
						ui.logToOutput(`Overwritten variable: ${varName}`);
					} else {
						// User closed the dialog
						skipped++;
						continue;
					}
				} else {
					// New variable
					process.env[varName] = valueStr;
					imported++;
					ui.logToOutput(`Imported new variable: ${varName}`);
				}
			}

			// Refresh the tree view
			this.treeDataProvider.refresh();

			// Show summary report
			let reportMessage = `Import completed!\n\n`;
			reportMessage += `Total variables in file: ${totalVars}\n`;
			reportMessage += `New variables imported: ${imported}\n`;
			reportMessage += `Existing variables overwritten: ${overwritten}\n`;
			reportMessage += `Variables skipped (by user): ${skipped}\n`;
			reportMessage += `Variables unchanged (equal values): ${unchanged}\n`;
			
			if (failed > 0) {
				reportMessage += `Failed to import: ${failed}\n`;
				reportMessage += `Failed variables: ${failedVars.join(', ')}`;
			}

			ui.showInfoMessage(reportMessage);
			ui.logToOutput(reportMessage);

		} catch (error) {
			ui.logToOutput('TreeView.importEnvironmentVariables Error: ' + error.message);
			ui.showErrorMessage('Failed to import environment variables: ' + error.message);
		}
	}

	async exportNode(node: TreeItem) {
		ui.logToOutput('TreeView.exportNode Started');
		
		if (node.TreeItemType !== TreeItemType.Key) {
			ui.showWarningMessage('Please select an environment variable to export');
			return;
		}

		try {
			const varName = node.Key;
			const varValue = process.env[varName];

			// Create YAML content for single variable
			const exportData = {
				metadata: {
					exportDate: new Date().toISOString(),
					platform: ui.getPlatformName(),
					version: '1.0',
					exportType: 'single-variable'
				},
				environmentVariables: {
					[varName]: varValue
				}
			};

			const yamlContent = yaml.dump(exportData, {
				indent: 2,
				lineWidth: -1,
				noRefs: true
			});

			// Show save dialog with variable name as default filename
			const safeFileName = varName.replace(/[^a-zA-Z0-9_-]/g, '_');
			const uri = await vscode.window.showSaveDialog({
				defaultUri: vscode.Uri.file(`${safeFileName}.yaml`),
				filters: {
					'YAML files': ['yaml', 'yml']
				},
				saveLabel: 'Export'
			});

			if (uri) {
				// Write to file
				const fs = require('fs');
				fs.writeFileSync(uri.fsPath, yamlContent, 'utf8');
				
				ui.showInfoMessage(`Successfully exported environment variable "${varName}" to ${uri.fsPath}`);
				ui.logToOutput(`Exported environment variable "${varName}" to ${uri.fsPath}`);
			}

		} catch (error) {
			ui.logToOutput('TreeView.exportNode Error: ' + error.message);
			ui.showErrorMessage('Failed to export environment variable: ' + error.message);
		}
	}

	async importNode(node: TreeItem) {
		ui.logToOutput('TreeView.importNode Started');

		// Note: importNode works the same as importEnvironmentVariables
		// It doesn't need the node parameter, but we keep it for consistency
		// The import dialog allows selecting any YAML file
		await this.importEnvironmentVariables();
	}

}

