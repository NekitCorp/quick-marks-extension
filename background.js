import { escapePredefinedEntities, getBookmarks, pluralize } from "./common.js";
import Fuse from "./lib/fuse.js";

chrome.omnibox.onInputChanged.addListener(onInputChanged);
chrome.omnibox.onInputEntered.addListener(onInputEntered);
chrome.bookmarks.onChanged.addListener(updateBookmarks);
chrome.bookmarks.onCreated.addListener(updateBookmarks);
chrome.bookmarks.onRemoved.addListener(updateBookmarks);

/**
 * Bookmarks global variable.
 * We should always check if it's null before using it,
 * because any global variables you set will be lost if the service worker shuts down.
 * @type {{ title: string, url: string }[] | null}
 * @see https://developer.chrome.com/docs/extensions/develop/concepts/service-workers/lifecycle#persist-data
 */
let bookmarks = null;

/**
 * @type {Parameters<chrome.omnibox.OmniboxInputChangedEvent['addListener']>[0]}
 */
async function onInputChanged(text, suggest) {
  if (!text) {
    await chrome.omnibox.setDefaultSuggestion({
      description: "🔎 Enter text to search bookmarks",
    });
    return;
  }

  if (!bookmarks) {
    await updateBookmarks();
  }

  const fuse = new Fuse(bookmarks, { keys: ["title", "url"] });
  const results = fuse.search(text);

  if (results.length === 0) {
    await chrome.omnibox.setDefaultSuggestion({
      description: "⛔ No bookmarks found. Press Enter to search on Google.",
    });
    suggest([]);
    return;
  }

  const suggestions = results.map(({ item }) => ({
    content: item.url,
    description: `<match>${escapePredefinedEntities(
      item.title
    )}</match> - <url>${escapePredefinedEntities(item.url)}</url>`,
  }));

  await chrome.omnibox.setDefaultSuggestion({
    description: `✅ Found ${pluralize(
      suggestions.length,
      "bookmark"
    )}. Use keyboard or mouse to select one.`,
  });

  suggest(suggestions);
}

/**
 * @type {Parameters<chrome.omnibox.OmniboxInputEnteredEvent['addListener']>[0]}
 */
async function onInputEntered(text) {
  if (!text) {
    return;
  }

  const url = text.startsWith("http")
    ? text
    : `https://www.google.com/search?q=${encodeURIComponent(text)}`;

  await chrome.tabs.create({ url });
}

async function updateBookmarks() {
  bookmarks = await getBookmarks();
}
