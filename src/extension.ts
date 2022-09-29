import * as vscode from 'vscode'
import { promises as fs, constants as fsc } from 'fs'
import path from 'path'

interface MarketplaceConfig {
    description?: string
    serviceUrl: string
    itemUrl: string
}

interface MarketplaceItem extends vscode.QuickPickItem {
    config?: MarketplaceConfig
}

class Switcher {
    private appDir: string
    private origPath: string
    private productPath: string
    private vscodeItem: MarketplaceItem
    private openvsxItem: MarketplaceItem

    constructor(appDir: string) {
        this.appDir = appDir
        this.origPath = path.join(this.appDir, 'product.json.orig')
        this.productPath = path.join(this.appDir, 'product.json')
        this.vscodeItem = {
            label: 'Visual Studio Code Marketplace',
        }
        this.openvsxItem = {
            label: 'open-vsx.org Marketplace',
            config: {
                serviceUrl: 'https://open-vsx.org/vscode/gallery',
                itemUrl: 'https://open-vsx.org/vscode/item',
            },
        }

    }

    async createMenu(): Promise<MarketplaceItem[]> {
        const options: MarketplaceItem[] = []
        try {
            await fs.access(path.join(this.appDir, 'product.json.orig')) // test if product.json.orig exists
            options.push(this.vscodeItem) // if the marketplace is modified (backup file exists), add option to revert
        } catch (e) {
        }
        options.push(this.openvsxItem)

        // add the user defined marketplaces
        const marketplaces: MarketplaceConfig[] = vscode.workspace.getConfiguration('openvsx.switcher').marketplaces
        options.push(...marketplaces.map(mp => ({
            label: mp.description || mp.serviceUrl,
            config: mp,
        })))

        return options
    }

    async revert() {
        try {
            await fs.access(this.origPath)
        } catch (e) {
            vscode.window.showErrorMessage(`Cannot revert the VS Code marketplace because of no access to ${this.origPath}`)
        }
        try {
            await fs.unlink(this.productPath)
            await fs.rename(this.origPath, this.productPath)
            vscode.window.showInformationMessage('Marketplace changed, restart Visual Studio Code to take effect.')
        } catch (e) {
            vscode.window.showErrorMessage(`Failed to revert the marketplace configuration: ${e}`)
        }
    }

    async switchTo(config: MarketplaceConfig) {
        try {
            try {
                await fs.access(this.origPath)
            } catch (e) {
                // if backup file doesn't exist, back up the original file
                await fs.copyFile(this.productPath, this.origPath)
            }
            const product = JSON.parse((await fs.readFile(this.productPath)).toString())
            product.extensionsGallery = { serviceUrl: config.serviceUrl, itemUrl: config.itemUrl }
            await fs.writeFile(this.productPath, Buffer.from(JSON.stringify(product)))
            vscode.window.showInformationMessage('Marketplace changed, restart Visual Studio Code to take effect.')
        } catch (e) {
            vscode.window.showErrorMessage(`Failed to update marketplace configuration: ${e}`)
        }
    }

    static create() {
        if (!require.main) {
            // shouldn't happen, just to be defensive, if we can't find the product.json, nothing we can do
            return null
        }

        return new Switcher(path.join(path.dirname(require.main.filename), '..'))
    }
}

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand('openvsx.switch', async () => {
        const switcher = Switcher.create()
        if (!switcher) {
            vscode.window.showErrorMessage('Failed to find the installation of running Visual Studio Code.')
            return
        }

        const marketplace = await vscode.window.showQuickPick(switcher.createMenu(), { title: 'Switch Marketplace'})
        if (!marketplace) {
            return
        }

        if (marketplace.config) {
            await switcher.switchTo(marketplace.config)
        } else {
            // no serviceUrl property associate, revert
            await switcher.revert()
        }
    }))
}
