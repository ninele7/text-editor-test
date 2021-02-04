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
import MarkdownIt from 'markdown-it'

const md = MarkdownIt()

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
        styleActiveLine: true
      })
      editor.on('change', () => {
        const value = editor.getValue()
        const html = md.render(value)
        if (editorPreview.value) {
          editorPreview.value.innerHTML = html
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
</style>
