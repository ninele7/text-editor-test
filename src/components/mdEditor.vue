<template>
  <div>
    <div ref="target" class="mdEditor"/>
  </div>
</template>

<script lang="ts">
import { onMounted, ref } from 'vue'
import { EditorState, Plugin, TextSelection } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { inputRules } from 'prosemirror-inputrules'
import { keymap } from 'prosemirror-keymap'
import createReplaceRules, { mySchema } from '@/components/createReplaceRules'
import { getMarkAttrs } from '@/components/getMarksAttrs'
import { findParentNodeOfType } from 'prosemirror-utils'
// import { schema } from 'prosemirror-schema-basic'
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import { buildKeymap } from 'prosemirror-example-setup'
import { baseKeymap } from 'prosemirror-commands'
import { Schema } from 'prosemirror-model'
import disableAllLinks from '@/components/disableAllLinks'

export default {
  setup () {
    const target = ref<HTMLDivElement | null>(null)
    onMounted(() => {
      if (!target.value) return
      const view = new EditorView(target.value, {
        state: EditorState.create({
          schema: mySchema,
          plugins: [
            inputRules({ rules: createReplaceRules() }),
            keymap(baseKeymap),
            keymap(buildKeymap(mySchema, true)),
            // new Plugin({
            //   props: {
            //     handleClick: (view, pos, event) => {
            //       const { schema } = view.state
            //       const attrs = getMarkAttrs(view.state, schema.marks.link)

            //       if (attrs.href && event.target instanceof HTMLAnchorElement && event.ctrlKey) {
            //         event.stopPropagation()
            //         window.open(attrs.href, attrs.target)
            //       }

            //       return false
            //     }
            //   }
            // }),
            new Plugin({
              props: {
                handleTextInput: (view, from, to, text) => {
                  console.log('here')
                  const nodeWithPos = findParentNodeOfType(mySchema.nodes.linkContainer)(view.state.selection)
                  const linkWithPos = findParentNodeOfType(mySchema.nodes.link)(view.state.selection)
                  if (nodeWithPos) {
                    if (nodeWithPos.pos === from - 2) {
                      const tr = view.state.tr
                      tr.insertText(text, from - 1)
                      const resolved = tr.doc.resolve(from - 1)
                      view.dispatch(tr.setSelection(new TextSelection(resolved, resolved)))
                      return true
                    }
                    if (nodeWithPos.pos + nodeWithPos.node.nodeSize === from + 2) {
                      const tr = view.state.tr
                      tr.insertText(text, from + 2)
                      const resolved = tr.doc.resolve(from + 3)
                      view.dispatch(tr.setSelection(new TextSelection(resolved, resolved)))
                      return true
                    }
                    return false
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

                    const nodeWithPos = findParentNodeOfType(mySchema.nodes.linkContainer)(view.state.selection)
                    const tr = state.tr
                    disableAllLinks(tr.doc, tr)

                    if (nodeWithPos) {
                      tr.setNodeMarkup(nodeWithPos.pos, undefined, { displayed: true })
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
      const attrs = {
        href: 'test',
        title: 'test'
      }
      const tr = view.state.tr
      const schema: Schema = view.state.schema
      const createdNode = schema.node('linkContainer', {}, [
        schema.node('hiddenLink', {}, schema.text('[')),
        schema.node('link', attrs, schema.text(attrs.title)),
        schema.node('hiddenLink', {}, schema.text(']')),
        schema.node('hiddenLink', {}, schema.text('(')),
        schema.node('hiddenLink', {}, schema.text(attrs.href)),
        schema.node('hiddenLink', {}, schema.text(')'))
      ])
      tr.replaceWith(1, 1, createdNode)
      console.log(createdNode)
      tr.insertText(' ', 1 + createdNode.nodeSize)
      view.dispatch(tr)
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
  display: inline;
  opacity: 0%;
  font-size: 0;
}

.link-container-displayed > .hidden-link {
  display: inline;
  opacity: 100%;
  font-size: 16px;
}
</style>
