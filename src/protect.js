/*
  Deters casual copying of the portfolio's work:
  - images can't be right-clicked, dragged out or long-pressed to save;
  - text can't be copied, except inside [data-copyable] (contact details).
  This isn't real protection — screenshots and dev tools still work — just friction.
*/
const isImage = (target) => target instanceof Element && target.closest('img, picture')
const inCopyable = (node) =>
  (node instanceof Element ? node : node?.parentElement)?.closest('[data-copyable]')

export function protectContent() {
  document.addEventListener('contextmenu', (event) => {
    if (isImage(event.target)) event.preventDefault()
  })

  document.addEventListener('dragstart', (event) => {
    if (isImage(event.target)) event.preventDefault()
  })

  // Allow copying only when the whole selection sits inside a copyable area.
  const blockCopy = (event) => {
    const selection = document.getSelection()
    if (selection && inCopyable(selection.anchorNode) && inCopyable(selection.focusNode)) return
    event.preventDefault()
  }
  document.addEventListener('copy', blockCopy)
  document.addEventListener('cut', blockCopy)
}
