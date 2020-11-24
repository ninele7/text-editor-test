<template>
  <div>
    <div ref="target" class="mdEditor"/>
  </div>
</template>

<script lang="ts">
import { onMounted, ref } from 'vue'
import { EditorState, Plugin, Selection, TextSelection } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { inputRules } from 'prosemirror-inputrules'
import { keymap } from 'prosemirror-keymap'
import createReplaceRules, { mySchema } from '@/components/createReplaceRules'
import { getMarkAttrs, getMarkRange } from '@/components/getMarksAttrs'
import { findParentNodeOfType, ContentNodeWithPos } from 'prosemirror-utils'
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
import { Mark } from 'prosemirror-model'

export default {
  setup () {
    const target = ref<HTMLDivElement | null>(null)
    let lastSelectedNode: ContentNodeWithPos | null = null
    onMounted(() => {
      if (!target.value) return
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const view = new EditorView(target.value, {
        state: EditorState.create({
          schema: mySchema,
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
            }),
            new Plugin({
              view () {
                return {
                  update (view, prevState) {
                    const state = view.state
                    if (prevState && prevState.doc.eq(state.doc) &&
                        prevState.selection.eq(state.selection)) return false

                    const linkWithPos = findParentNodeOfType(mySchema.nodes.link)(view.state.selection)
                    const nodeWithPos = findParentNodeOfType(mySchema.nodes.linkContainer)(view.state.selection)
                    const tr = state.tr

                    if (lastSelectedNode) {
                      tr.setNodeMarkup(lastSelectedNode.pos, undefined, { displayed: false })
                    }

                    if (linkWithPos) {
                      if (nodeWithPos) {
                        lastSelectedNode = nodeWithPos
                        tr.setNodeMarkup(nodeWithPos.pos, undefined, { displayed: true })
                      }
                    }

                    view.dispatch(tr)

                    return false
                  }
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

.link-container > .hidden-link {
  display: none;
}

.link-container-displayed > .hidden-link {
  display: inline;
}
</style>
