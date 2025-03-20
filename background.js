chrome.omnibox.onInputChanged.addListener(onInputChanged);
chrome.omnibox.onInputEntered.addListener(onInputEntered);

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

  const bookmarks = await chrome.bookmarks.search(text);

  if (bookmarks.length === 0) {
    await chrome.omnibox.setDefaultSuggestion({
      description: "⛔ No bookmarks found. Press Enter to search on Google.",
    });
    suggest([]);
    return;
  }

  const suggestions = bookmarks
    .filter((bookmark) => bookmark.url && bookmark.title)
    .map((bookmark) => ({
      content: bookmark.url,
      description: `<match>${escapePredefinedEntities(
        bookmark.title
      )}</match> - <url>${escapePredefinedEntities(bookmark.url)}</url>`,
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

/**
 * You must escape the five predefined entities to display them as text.
 * @see https://developer.chrome.com/docs/extensions/reference/api/omnibox#type-SuggestResult
 * @see https://stackoverflow.com/a/1091953/89484
 */
function escapePredefinedEntities(text) {
  return text
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/&/g, "&amp;");
}

function pluralize(count, noun) {
  return `${count} ${noun}${count !== 1 ? "s" : ""}`;
}
