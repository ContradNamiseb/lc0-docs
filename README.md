# Lc0 Doxygen Documentation

This directory contains the doxygen generated documentation for Leela Chess Zero engine.
This was generated from lc0-master commit(7f572ae89884ef9f5012afe9f5127dc069ab6c9b).

## Directory Structure:

- `index.html`: The main entry point. This is the only HTML file in the root.
- `pages/`: Contains all other HTML documentation pages.
- `js/`: Application JavaScript and generated data fragments.
- `css/`: Stylesheets.
- `images/`: Image assets.
- `search/`: Search functionality scripts and data.

## Linking Strategy

- **Root Access**: `index.html` loads navigation data relative to the current directory.
- **Page Access**: Files in `pages/` load resources using `../` (e.g., `../js/navtree.js`).
- **Dynamic Loading**: `navtree.js` has been patched to correctly identify the base path for loading fragments, so it works from both the root and `pages/` directory. Symlinks for `navtreeindex*.js` and `sync_*.png` are placed in the root and `pages/` to ensure availability.

## Site Access

The documentation is hosted at: https://contradnamiseb.github.io/lc0-docs/

---
Made with Antigravity and Gemini
