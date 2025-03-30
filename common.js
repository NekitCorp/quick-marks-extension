export async function getBookmarks() {
  const tree = await chrome.bookmarks.getTree();
  /** @type {{ title: string, url: string }[]} */
  const bookmarks = [];

  /**
   * @param {chrome.bookmarks.BookmarkTreeNode[]} tree
   */
  const dfs = (tree) => {
    for (const node of tree) {
      if (node.url) {
        bookmarks.push({
          title: node.title,
          url: node.url,
        });
      }
      if (node.children) {
        dfs(node.children);
      }
    }
  };

  dfs(tree);

  return bookmarks;
}

/**
 * You must escape the five predefined entities to display them as text.
 * @see https://developer.chrome.com/docs/extensions/reference/api/omnibox#type-SuggestResult
 * @see https://stackoverflow.com/a/1091953/89484
 */
export function escapePredefinedEntities(text) {
  return text
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/&/g, "&amp;");
}

/**
 * @param {number} count
 * @param {string} noun
 * @returns {string}
 */
export function pluralize(count, noun) {
  return `${count} ${noun}${count !== 1 ? "s" : ""}`;
}

/**
 * Get the URL of the favicon for a page.
 * @param {string} pageUrl
 * @returns {string}
 */
export function faviconURL(pageUrl) {
  const url = new URL(chrome.runtime.getURL("/_favicon/"));
  url.searchParams.set("pageUrl", pageUrl);
  url.searchParams.set("size", "32");
  return url.toString();
}
