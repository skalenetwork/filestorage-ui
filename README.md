```bash
yarn
yarn dev
```

Entry point: `pages/-app.tsx`

![](https://i.imgur.com/yTDydFu.png)

## UI Components - Overview

- [ ] Wallet multi-connect
- [x] Uploader
- [x] Space reservation 
- [x] Total usage metrics
- [x] Navigable datatable
- [x] Breadcrumb + Address switch
- [ ] Search

## To locate

- [ ] Chain owner
- [ ] Timestamps not found in contracts

## Codebase: heads up for templating

- Project uses tailwind class-based styling.. for those not familiar but seasoned with CSS, you can pick pace in ~3h, after that it's intuitive with occasional doc-check. For backend devs doing minor template updates, come with a temporary counter-DRY mindset, and you'll find less friction.

## Learnings from failed sprints

- There is no stable single solution for embedded arbitrary file viewing, solution lies in identifying media type and using 2-3 libraries.

Wallet provider DX

- `wagmi` + `rainbowkit` is a neat choice but `rainbowkit` doesn't yet support many wallets.

- `wagmi` doesn't easily interoperate with `web3modal`.

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