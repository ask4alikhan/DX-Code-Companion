'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import {CommandService} from './services/commandBuilder';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    let retrieveSource = vscode.commands.registerCommand('retrieve.dxSource', () => {
        // The code you place here will be executed every time your command is executed
        retrieveDXSource();
    });

    let deploySource = vscode.commands.registerCommand('deploy.source', () => {
        let activeTerminal = setupTerminal();
        if(activeTerminal){
            if(vscode.window.activeTextEditor){
                let path = vscode.window.activeTextEditor.document.uri.fsPath;
                if(process.platform.includes('win')) {
                    path = toUnixStyle(path); //change to unix style for windows
                }
                const commandToExecute = new CommandService(path);
                activeTerminal.sendText(commandToExecute.generateCommand());
                console.log(process.platform);
            }
        }

    });

    context.subscriptions.push(retrieveSource);
    context.subscriptions.push(deploySource);
}

    function setupTerminal() {
        let activeTerminal;
        if(ensureTerminalExists()){
            activeTerminal = vscode.window.terminals[0];
            if(activeTerminal){
                activeTerminal.show(true);
            }
        } else {
            // Create Terminal via VScode API
            const terminalName = 'DX Companion';
            activeTerminal = vscode.window.createTerminal(terminalName);
            activeTerminal.show(true);
        }
        return activeTerminal;
    }

    async function retrieveDXSource(){
        const unmanagedpkg = await showInputBox('Enter Package Name');
        if(unmanagedpkg) {
            let activeTerminal = setupTerminal();
            if(activeTerminal){
                let retrievecommand = 'sfdx retrieve:dxsource -n ' + '"' + unmanagedpkg + '"';
                activeTerminal.sendText(retrievecommand);
            }
        }
    }

    async function showInputBox(placeholder: string) {
        const result = await vscode.window.showInputBox({
            ignoreFocusOut : true,
            value: undefined,
            valueSelection: [2, 4],
            placeHolder: placeholder,
            prompt: placeholder
        });
        return result;
    }

    function ensureTerminalExists(): boolean {
        if ((<any>vscode.window).terminals.length === 0) {
            return false;
        }
        return true;
    }

    function toUnixStyle(path: string): string {
        return path.replace(/\\/g, "/");
    } 

    // this method is called when your extension is deactivated
    export function deactivate() {

    }