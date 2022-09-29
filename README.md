# Marketplace Switcher

Allow Visual Studio Code to use [open-vsx.org](https://open-vsx.org) or other marketplace.

## How to use

Run command `Switch Marketplace` from Command Pallette and select from Visual Studio Code,
open-vsx.org, or user-defined marketplace.
And then, restart Visual Studio Code to make it take effect.

## Marketplace definition

User-defined marketplace should be put in settings `openvsx.switcher.marketplaces`, which is an array of objects.
Each object represents a marketplace, having the following properties,

|Name|Description|Required|Comment|
|------|------|------|------|
|`description`|Name of the marketplace|No|
|`serviceUrl`|Url to the extension searching service|Yes|Provided by the marketplace provider|
|`itemUrl`|Url to extension detail pages|Yes|Provided by the marketplace provider|

## How the extension works

In the Visual Studio Code installation, a `product.json` file contains the setting of marketplace.
This extension updates this file when user chooses a new marketplace.
Restart Visual Studio Code is required to pick up the new setting.

Please refer to [Open VSX's document](https://github.com/eclipse/openvsx/wiki/Using-Open-VSX-in-VS-Code).

---
Icon made by [Uniconlabs](https://www.flaticon.com/authors/uniconlabs) from [Flaticon](https://www.flaticon.com/)