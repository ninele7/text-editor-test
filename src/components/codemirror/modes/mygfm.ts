import CodeMirror from 'codemirror'
import { ipcMain, ipcRenderer } from 'electron'

CodeMirror.defineMode('mymd', (config, modeConfig) => {
  return {
    startState () {
      return {
        bold: false,
        linkName: false,
        beforeLinkHref: false,
        linkHref: false
      }
    },
    token (stream, state) {
      // LINK RELATED
      if (stream.peek() === '[') {
        state.linkName = true
        stream.next()
        return 'link-name hidden'
      }

      if (state.linkName && stream.peek() !== ']') {
        if (stream.skipTo(']')) {
          return 'link-name'
        }
        stream.skipToEnd()
        return null
      }

      if (stream.peek() === ']' && state.linkName) {
        state.linkName = false
        state.beforeLinkHref = true
        stream.next()
        return 'link-name hidden'
      }

      if (state.beforeLinkHref && stream.peek() !== '(') {
        state.beforeLinkHref = false
        stream.next()
        return null
      }

      if (state.beforeLinkHref && stream.peek() === '(') {
        state.beforeLinkHref = false
        state.linkHref = true
        stream.next()
        return 'link-href hidden'
      }

      if (state.linkHref && stream.peek() !== ')') {
        if (stream.skipTo(')')) {
          return 'link-href hidden'
        }
        stream.skipToEnd()
        return 'link-href hidden'
      }

      if (stream.peek() === ')' && state.linkHref) {
        state.linkHref = false
        stream.next()
        return 'link-href hidden'
      }

      // BOLD RELATED
      if (stream.peek() === '*' && !state.bold) {
        state.bold = true
        stream.next()
        return 'bold hidden'
      }

      if (stream.peek() === '*' && state.bold) {
        state.bold = false
        stream.next()
        return 'bold hidden'
      }

      if (state.bold) {
        if (stream.skipTo('*')) {
          return 'bold'
        }
        stream.skipToEnd()
        return 'bold'
      }

      stream.next()
      return null
    }
  }
})

CodeMirror.defineOption('cursorActivator', true, (cm: CodeMirror.Editor) => {
  cm.on('cursorActivity', () => {
    if (cm.state.mark) { cm.state.mark.clear() }
    const cursor = cm.getCursor()
    const mark = cm.markText(CodeMirror.Pos(cursor.line, cursor.ch), CodeMirror.Pos(cursor.line, cursor.ch + 1), { startStyle: 'cm-selected', endStyle: 'cm-selected' })
    cm.state.mark = mark
  })

  cm.on('mousedown', (cm, e) => {
    if (e.target instanceof HTMLSpanElement && e.target.className.includes('cm-link-name')) {
      if (e.target.nextSibling && e.target.nextSibling.nextSibling &&
        e.target.nextSibling.nextSibling instanceof HTMLSpanElement &&
        e.target.nextSibling.nextSibling.className.includes('cm-link-href')) {
        const href = e.target.nextSibling.nextSibling.innerHTML
        ipcRenderer.invoke('open-link-in-browser', href.slice(1, href.length - 1))
      }
    }
  })
})
