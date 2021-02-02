<template>
  <div>
    <textarea ref="editorTarget" class="mdEditor"/>
  </div>
</template>

<script lang="ts">
import { onMounted, ref } from 'vue'
import codemirror from 'codemirror'
import 'codemirror/lib/codemirror.css'
import './modes/mygfm.ts'
import 'codemirror/addon/selection/active-line'

export default {
  setup () {
    const editorTarget = ref<HTMLTextAreaElement | null>(null)
    onMounted(() => {
      if (!editorTarget.value) return
      const editor = codemirror.fromTextArea(editorTarget.value, {
        mode: 'mymd',
        lineNumbers: true,
        theme: 'default',
        extraKeys: { Enter: 'newlineAndIndentContinueMarkdownList' },
        styleActiveLine: true
      })
    })

    return {
      editorTarget
    }
  }
}
</script>

<style lang="scss">
.cm-bold {
  font-weight: bold;
}

.cm-bold.cm-hidden {
  opacity: 0%;
  letter-spacing: -1ch;
}

.CodeMirror-activeline .cm-bold.cm-hidden {
  opacity: 100%;
  letter-spacing: 0px;
}
</style>
