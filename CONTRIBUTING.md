# Contributing

Thanks for your interest in improving **Royal Inauguration System**! 🎭

## Getting set up

```bash
git clone https://github.com/<your-username>/Royal-Inaguration-System.git
cd Royal-Inaguration-System
npm start            # serves ./src at http://localhost:8000
npm run validate     # checks JS syntax, file references and gallery images
```

No build step or dependencies are needed — the project is plain HTML, CSS and JavaScript.

## Workflow

1. Fork the repo and create a branch: `git checkout -b feat/my-change`
2. Make your change inside `src/`
3. Run `npm run validate`
4. Test the **display** and **controller** together in two browser tabs
5. Commit using [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, `refactor:`)
6. Open a Pull Request using the template

## Guidelines

- Keep the project dependency-free and static-hosting friendly.
- Follow `.editorconfig` (UTF-8, LF, 2 spaces).
- Name new posters `poster-NN.ext` and register them in `src/assets/js/gallery.js`.
- Compress images before committing (aim for < 500 KB each).
