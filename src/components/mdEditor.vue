<template>
  <div>
    <div ref="target" class="mdEditor"/>
  </div>
</template>

<script lang="ts">
import { onMounted, ref } from 'vue'
import { EditorState, Plugin } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { inputRules } from 'prosemirror-inputrules'
import { keymap } from 'prosemirror-keymap'
import createReplaceRules from '@/components/createReplaceRules'
import getMarkAttrs from '@/components/getMarksAttrs'
// import { schema } from 'prosemirror-schema-basic'
import {
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  schema
} from 'prosemirror-markdown'
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import { buildKeymap } from 'prosemirror-example-setup'
import { baseKeymap } from 'prosemirror-commands'

export default {
  setup () {
    const target = ref<HTMLTextAreaElement | null>(null)

    onMounted(() => {
      if (!target.value) return
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const view = new EditorView(target.value, {
        state: EditorState.create({
          schema,
          plugins: [
            inputRules({ rules: createReplaceRules() }),
            keymap(buildKeymap(schema, true)),
            keymap(baseKeymap),
            new Plugin({
              props: {
                handleClick: (view, pos, event) => {
                  const { schema } = view.state
                  const attrs = getMarkAttrs(view.state, schema.marks.link)

                  if (attrs.href && event.target instanceof HTMLAnchorElement && event.ctrlKey) {
                    event.stopPropagation()
                    window.open(attrs.href, attrs.target)
                  }

                  return false
                }
              }
            })
          ]
        })
      })
    })
    return {
      target
    }
  }
}
</script>

<style lang="scss">
.ProseMirror {
  background-color: #EEE;
  max-width: 100vw;
  min-height: 100vh;
  padding: 4px;
}

p {
  margin-top: 0;
}

h1 {
  margin-top: 0;
}
</style>
