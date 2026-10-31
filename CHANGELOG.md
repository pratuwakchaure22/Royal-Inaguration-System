# Changelog

All notable changes to this project are documented here. Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [1.0.0] - 2026-10-29

### Added
- Dedicated `src/` folder for the deployable site; documentation, Firebase rules and tooling live at the repo root
- Separate CSS and JavaScript files for the display, controller and landing page
- `gallery.js` — single place to manage posters and participant names
- Poster images renamed to `poster-NN.ext`
- `npm run validate` project checker and GitHub Actions CI + Pages deployment
- Recommended Firebase security rules, config template, architecture guide
- Community files: contributing guide, code of conduct, security policy, issue and PR templates

### Fixed
- Controller poster counter no longer goes negative or past the last poster
- Stored poster index in Firebase now wraps around the gallery length
