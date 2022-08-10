## Week 6

priors

[x] faster lookups: client-side file listing caching + deep prefetch

[ ] squash bugs + netting: final pass widget field validations, form resetting
[x] pagination: fix no collapse
[x] preview + download file: finalize
[x] upload-progress: fix line item alignments
[x] cwd reload: silent refresh without loading state

[x] toast when background errors / notifications (offline etc)
[ ] configure trustwallet and fortmatic
[ ] back-channel pvt key validation against connected account
[ ] watch on wallet address change etc.

[ ] upload:edge: bulk upload: list conflicted names for editing
[ ] upload:edge: also detect conflicts within selected uploads (can happen due to renaming)
[ ] upload:edge: enable other cases (ex: upload on upload) by adding queues, isolate dequeue logic
[ ] all:improvement: bring queuing to everything

feedback

[ ] by mockups: upload list to bottom right
[ ] upload-progress: failed item -> click cross -> retry icon (hover::green) -> click to retry
[ ] reserve-widget: unit select for space and relevant validation
[x] widgets: where address input, confirm and correctly validate prefix 0x (make common validate and transform utils)
[x] neater file shortening

post-MVP

[ ] enablement: bulk / batch / parallelized transactions: TBD
[ ] upload-progress:edge: with above, simulate increasing progress after upload init event

## Week 5

priors

[x] add field validations
[x] finalize role granter flow
[x] finalize reserve space flow
[x] role checks and conditional view
[ ] embedded file preview
[ ] faster lookups: client-side file listing caching + deep prefetch

feedback

[x] close smart address field when off-focus
[x] clickable home nav against smart address
[ ] file preferred direct download, fallback contract call
[ ] general notifications / errors
[x] uploads with each progress
[ ] by mockups: upload list to bottom right
[x] detect duplications in upload form as field validation

frontier

[ ] keying transaction operations: progress management
[ ] enablement: bulk / batch / parallelized transactions: TBD

## Week 4

priors

[x] re-org forms for field validations
[ ] add field validations
[x] failed upload(s) modal? (multi-file / duplicate UX TBD)
[ ] add role grantor flow
[ ] finalize reserve space flow

feedback

[x] upload multi-files: name-edit-in-place. at 20+, flag as batch
[x] file list exclude timestamp
[x] connected account view to be consistent with status bar width
[x] by mockups: address change input view mode shortened + edit mode prominent
[x] by mockups: make modal formatting ditto + top-right cross
[x] navigability from breadcrumb
[x] by mockups: pagination "showing x of y" 
[x] folders precedence in sorting
[x] consistent file click action
[x] versatile file formatted name prefix icons

frontier

[ ] embedded file preview
[ ] download file progressively
[ ] realized swiftness: client-side file listing caching + deep prefetch

## Week 3

priors

[x] trial ready deployment
[x] connect wallet button
[x] choose wallet provider modal on connect wallet
[x] table sorting
[x] table pagination
[x] switch listing from editable address in breadcrumb
[ ] errored upload (multi-file UX TBD)
[ ] download file progressively
[ ] realized swiftness: client-side file listing caching + deep prefetch

feedback

[x] connected address formatted in short-form
[x] open directory with single click
[x] directory navigate to previous with top directory entry as two dots only (like github)
[x] file / dir name+icon formatted to be compact
[x] show > 0 percentage in capacity status
[x] by mockup: breadcrumb item formatting
[x] no jitters during UX
[x] while processing new directory, disable create directory button with loading icon
[ ] open file actions menu on file single click (probably using right click to be consistent for dir and file.. UX TBD)
[ ] by mockups: upload files button -> open modal -> choose files button -> pick files -> list files (allow name change .. UX TBD) -> confirm -> list current uploads + single simulated progress bar
[x] search term -> dropdown with results -> [click:file -> download, click:dir -> navigate] (first-release: slowness expected)
[ ] file list - configurable fields (exclude timestamp)