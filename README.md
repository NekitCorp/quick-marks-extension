# QuickMarks browser extension

With QuickMarks, you can quickly search bookmarks using its dedicated interface (launched with `Alt + Shift + H`) or find them instantly right from Chrome’s omnibox (URL bar).

## How to use?

### UI search

1. Press the keyboard shortcut `Alt + Shift + H` or click the QuickMarks icon in the Extensions menu bar.
2. Now enter your query and use the arrow keys or mouse to select the desired bookmark to open it in a new tab.

### Omnibox search

1. Open a new tab. Type `*` (asterisk) to URL bar and press `tab`. This activates QuickMarks search.
2. Now, type "coffee" to find your saved bookmarks related to coffee.

## Change shortcut

1. Go to the `Manage Extensions` page through the extensions icon in the menu bar or copy and navigate to `chrome://extensions/`.
2. In the left menu, select `Keyboard shortcuts`, find the `QuickMarks` extension, and set your own shortcut.

## Prepare package

```sh
rm -f package.zip && zip -r package.zip images lib popup background.js common.js manifest.json
```
