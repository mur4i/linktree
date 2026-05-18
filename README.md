# linktree

Personal links page for **Murai Dev**, deployed to GitHub Pages at
[mur4i.github.io/linktree](https://mur4i.github.io/linktree).

## Stack

- React 18 (Create React App)
- Plain CSS with custom properties — shadcn-inspired neutral palette + emerald accent
- Deployed via `gh-pages`

## Development

```bash
npm install
npm start
```

Opens [http://localhost:3000](http://localhost:3000) with hot reload.

## Deploy

```bash
npm run deploy
```

Builds the production bundle and pushes it to the `gh-pages` branch.

## Structure

```
src/
├── App.js, App.css           # layout shell
├── index.js, index.css        # entry + design tokens
└── components/
    ├── Header/                # avatar, name, role, location
    ├── Links/                 # nav links with inline SVG icons
    └── Footer/                # year + signature
```

To edit the link list, change the `links` array in
[`src/components/Links/Links.js`](src/components/Links/Links.js).
