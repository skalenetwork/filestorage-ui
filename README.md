```bash
yarn
yarn dev
```

Start from: `pages/app.tsx` and `context/index.tsx`.

![](https://i.imgur.com/ACfouYg.png)


## UI Components - Overview

- [x] Wallet picker
- [x] Multi-file uploader
- [x] Space reservation 
- [x] Role allocation
- [x] Total usage metrics
- [x] File Navigator: paginated + sortable + actionable
- [x] Breadcrumb
- [x] Address switch
- [x] Search

## To locate

- [ ] Chain owner
- [ ] Timestamps not found in contracts (possibility: history watch + cache / indexing-at-node)

## Wallet provider DX

- `wagmi` + `rainbowkit` is a neat choice but `rainbowkit` doesn't yet support many wallets.

- `wagmi` doesn't easily interoperate with `web3modal`.

## Codebase: Structure

### src/context

App contexts mainly using Context API, includes File Manager context hook that can isolated away later.

### src/pages

Contains pages, initially single app.tsx is central and sufficient

### src/components

Components either re-used across the application, or small enough to be re-used.

### src/partials

HOCs on groups of components, could be later merged into `src/components`

### src/services

Modules consumed by the app to perform domain-specific operations. Currently, includes only `filemanager.ts` which is to be isolated away as a package.

### src/styles

Contains global styling files, and tailwind imports, initially limited use for overrides.

### main.tsx

Main entry point that mounts the app with context.

### src/config.ts

Global configuration file is loaded into app context, allowing use of static defaults declared client-side and types for extendability.

### polyfill.ts

Polyfills to non-browser-native libraries, vite does not automatically bundle these.

### utils.ts

Utility functions usable across the app

## Codebase: heads up for templating

Project uses tailwind class-based styling.

- For those not familiar but seasoned with CSS, you can pick pace in ~3h, after that it's intuitive with occasional doc-check.

- For backend devs doing minor template updates, come with a temporary counter-DRY mindset, and you'll find less friction.

----

## Related

![](https://lh4.googleusercontent.com/L7QDeVkbeC3ps2OIynXJCspjsrTUJHsEGIdL_0q0IjIVfoztd9T5dnGyEGvvJotH6dBrhr7czgMdpiWrmneYcwpBk8t2GULhl4FxdN2CAw6IkvGcUdGLiAix7uVes0dGR1tGNPC-)

- [Filestorage.js](https://github.com/skalenetwork/filestorage.js/tree/1.0.1-develop.5)
- [Filestorage.js examples](https://docs.skale.network/filestorage.js/1.0.x/) 
- [skale-demo](https://github.com/skalenetwork/skale-demo/tree/master/file-storage)

## Batching UX : relevant - future above water

[EIP-2255](https://eips.ethereum.org/EIPS/eip-2255)

projection by MM
![](https://pbs.twimg.com/media/EIKULr5XsAASISn?format=jpg)