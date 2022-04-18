import * as vscode from 'vscode'

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand('openvsx.switch', async () => {
        return vscode.window.showQuickPick(['vscode', 'open-vsx.org'])
    }))
}
