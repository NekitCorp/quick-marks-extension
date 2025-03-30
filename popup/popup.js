import { faviconURL, getBookmarks } from "../common.js";
import Fuse from "../lib/fuse.js";

// DOM elements

const template = /** @type {HTMLTemplateElement} */ (
  document.getElementById("li_template")
);
const search = /** @type {HTMLInputElement} */ (
  document.getElementById("search")
);
const results = /** @type {HTMLUListElement} */ (
  document.getElementById("results")
);

// initialize

/** @type {{ title: string, url: string }[]} */
let bookmarks = [];
let selected = null;

getBookmarks().then((result) => {
  bookmarks = result;
  search.disabled = false;
  search.focus();
  updateSuggestions("");
});

// event listeners

search.addEventListener("input", handleInput);
search.addEventListener("keydown", handleKeydown);

// handlers

/**
 * @param {Event} e
 */
async function handleInput(e) {
  const target = /** @type {HTMLInputElement} */ (e.target);
  const text = target.value;
  await updateSuggestions(text);
}

/**
 * @param {KeyboardEvent} e
 */
function handleKeydown(e) {
  if (e.key === "ArrowDown") {
    e.preventDefault();
    if (selected && selected.nextElementSibling) {
      selected.classList.remove("selected");
      selected.nextElementSibling.classList.add("selected");
      selected = selected.nextElementSibling;
      selected.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    if (selected && selected.previousElementSibling) {
      selected.classList.remove("selected");
      selected.previousElementSibling.classList.add("selected");
      selected = selected.previousElementSibling;
      selected.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  } else if (e.key === "Enter") {
    e.preventDefault();
    if (selected) {
      selected.querySelector(".link")?.click();
    }
  }
}

/**
 * @param {string} text
 */
async function updateSuggestions(text) {
  let suggestions;

  if (text) {
    const fuse = new Fuse(bookmarks, { keys: ["title", "url"] });
    const results = fuse.search(text);
    suggestions = results.map(({ item }) => createSuggestionElement(item));
  } else {
    suggestions = bookmarks.map((bookmark) =>
      createSuggestionElement(bookmark)
    );
  }

  if (suggestions.length > 0) {
    selected = suggestions[0].firstElementChild;
    selected.classList.add("selected");
  }

  results.replaceChildren(...suggestions);
}

/**
 * Build a suggestion element for a bookmark.
 * @param {{ title: string, url: string }} bookmark
 * @returns {HTMLLIElement}
 */
function createSuggestionElement(bookmark) {
  const li = /** @type {HTMLLIElement} */ (template.content.cloneNode(true));

  /** @type {HTMLImageElement} */ (li.querySelector(".favicon")).src =
    faviconURL(bookmark.url);
  li.querySelector(".title").textContent = bookmark.title;
  li.querySelector(".url").textContent = bookmark.url;
  li.querySelector(".link").addEventListener("click", () => {
    chrome.tabs.create({ url: bookmark.url });
  });

  return li;
}
