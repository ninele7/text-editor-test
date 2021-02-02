import CodeMirror from 'codemirror'

CodeMirror.defineMode('mymd', (config, modeConfig) => {
  return {
    startState () {
      return {
        bold: false
      }
    },
    token (stream, state) {
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
    console.log('here')
    if (cm.state.mark) { cm.state.mark.clear() }
    const cursor = cm.getCursor()
    const mark = cm.markText(CodeMirror.Pos(cursor.line, cursor.ch), CodeMirror.Pos(cursor.line, cursor.ch + 1), { startStyle: 'cm-selected', endStyle: 'cm-selected' })
    cm.state.mark = mark
  })
})
