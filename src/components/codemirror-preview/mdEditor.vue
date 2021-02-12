<template>
    <div>
      <div class="mdEditor">
        <textarea @click="handleClick" ref="editorTarget" />
      </div>
        <div ref="editorPreview" class="mdPreview" />
    </div>
</template>

<script lang='ts'>
import { onMounted, ref } from 'vue'
import codemirror from 'codemirror'
import 'codemirror/mode/gfm/gfm'
import 'codemirror/addon/selection/active-line'
import 'codemirror/lib/codemirror.css'
import 'codemirror/addon/edit/continuelist'
import 'codemirror/addon/hint/show-hint'
import 'codemirror/addon/edit/closebrackets'
import MarkdownIt from 'markdown-it'

const md = MarkdownIt({
  html: true
})

export default {
  setup () {
    const editorTarget = ref<HTMLTextAreaElement | null>(null)
    const editorPreview = ref<HTMLDivElement | null>(null)
    onMounted(() => {
      if (!editorTarget.value) return
      const editor = codemirror.fromTextArea(editorTarget.value, {
        mode: 'gfm',
        lineNumbers: true,
        theme: 'default',
        extraKeys: { Enter: 'newlineAndIndentContinueMarkdownList' },
        styleActiveLine: true,
        autoCloseBrackets: true
      })
      editor.on('change', () => {
        const value = editor.getValue()
        const html = md.render(value)
        if (editorPreview.value) {
          editorPreview.value.innerHTML = html
        }
      })
      editor.on('keyup', (_, e) => {
        const options = {
          hint: function () {
            const cursor = editor.getDoc().getCursor()
            return {
              from: cursor,
              to: cursor,
              list: ['foo', 'bar']
            }
          }
        }

        const cursor = editor.getDoc().getCursor()
        if (!editor.state.completionActive && e.code === 'BracketLeft' && editor.getDoc().getLine(cursor.line).substr(cursor.ch - 2, 2) === '[[') {
          editor.getDoc().setCursor(cursor.line, cursor.ch)
          editor.showHint(options)
        }
      })
    })

    return {
      editorTarget,
      editorPreview
    }
  }
}
</script>

<style lang="scss">
.mdEditor {
  width: 50vw;
  height: 100%;
  float: left;
}

.mdPreview {
  width: 50vw;
  float: right;
  background-color: #eee;
  height: 100%;
}

.CodeMirror { height: 100%; }

.CodeMirror-hints {
  position: absolute;
  z-index: 10;
  overflow: hidden;
  list-style: none;

  margin: 0;
  padding: 2px;

  -webkit-box-shadow: 2px 3px 5px rgba(0,0,0,.2);
  -moz-box-shadow: 2px 3px 5px rgba(0,0,0,.2);
  box-shadow: 2px 3px 5px rgba(0,0,0,.2);
  border-radius: 3px;
  border: 1px solid silver;

  background: white;
  font-size: 90%;
  font-family: monospace;

  max-height: 20em;
  overflow-y: auto;
}

.CodeMirror-hint {
  margin: 0;
  padding: 0 4px;
  border-radius: 2px;
  white-space: pre;
  color: black;
  cursor: pointer;
}

li.CodeMirror-hint-active {
  background: #08f;
  color: white;
}

</style>
