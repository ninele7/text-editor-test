<template>
  <div>
    <input type="button" value="Click Me" @click="buttonClickHandler" >
    <div ref="target" class="mdEditor"/>

  </div>
</template>

<script lang="ts">
import { onMounted, ref } from 'vue'
import { EditorState, Plugin, TextSelection, Selection } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { inputRules } from 'prosemirror-inputrules'
import { keymap } from 'prosemirror-keymap'
import createReplaceRules, { mySchema } from '@/components/createReplaceRules'
import { getMarkAttrs } from '@/components/getMarksAttrs'
import { findParentNode, findParentNodeClosestToPos, findParentNodeOfType } from 'prosemirror-utils'
// import { schema } from 'prosemirror-schema-basic'
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import { buildKeymap } from 'prosemirror-example-setup'
import { baseKeymap } from 'prosemirror-commands'
import { Schema } from 'prosemirror-model'
import disableAll from '@/components/disableAllLinks'

export default {
  setup () {
    const target = ref<HTMLDivElement | null>(null)
    // let viewToGlobalContext = null

    onMounted(() => {
      if (!target.value) return
      // let triggeredByRegex = false
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
                  console.log(`handleTextInput from ${from} to ${to} text: ${text}`)
                  let nodeWithPos = findParentNodeOfType(mySchema.nodes.linkContainer)(view.state.selection)

                  const linkWithPos = findParentNodeOfType(mySchema.nodes.link)(view.state.selection)
                  if (nodeWithPos) {
                    console.log('handle text input in link. nodeWithPos: ', nodeWithPos)
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

                  nodeWithPos = findParentNodeOfType(mySchema.nodes.boldContainer)(view.state.selection)
                  if (nodeWithPos) {
                    console.log('handle text input in bold. nodeWithPos: ', nodeWithPos)
                    console.log(`from (${from}) - nodeWithPos.pos (${nodeWithPos.pos}) = `, from - nodeWithPos.pos)
                    if (nodeWithPos.pos === from - 2) {
                      console.log(`nodeWithPos.pos (${nodeWithPos.pos}) === from (${from}) - 2`)
                      const tr = view.state.tr
                      tr.insertText(text, from - 1)
                      const resolved = tr.doc.resolve(from - 1)
                      view.dispatch(tr.setSelection(new TextSelection(resolved, resolved)))
                      return true
                    }

                    if (nodeWithPos.pos === from - 3) {
                      console.log(`nodeWithPos.pos (${nodeWithPos.pos}) === from (${from}) - 3 (into opening asterix)`)
                      console.log('nodeWithPos', nodeWithPos)
                      const tr = view.state.tr
                      const schema: Schema = view.state.schema
                      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
                      // @ts-ignore
                      tr.replaceWith(nodeWithPos.pos, nodeWithPos.pos + nodeWithPos.node.nodeSize, schema.text(nodeWithPos.node.content.content[0].textContent + nodeWithPos.node.content.content[1].textContent + nodeWithPos.node.content.content[2].textContent))
                      tr.insertText(text, nodeWithPos.pos + 1)
                      const resolved = tr.doc.resolve(from - 1)
                      view.dispatch(tr.setSelection(new TextSelection(resolved, resolved)))
                      return true
                    }
                    if (nodeWithPos.pos === from - 4) {
                      console.log(`nodeWithPos.pos (${nodeWithPos.pos}) === from (${from}) - 4`)
                      const tr = view.state.tr
                      tr.insertText(text, from + 2)
                      const resolved = tr.doc.resolve(from + 3)
                      view.dispatch(tr.setSelection(new TextSelection(resolved, resolved)))
                      return true
                    }
                    if (nodeWithPos.pos + nodeWithPos.node.nodeSize === from + 2) {
                      console.log(`nodeWithPos.pos (${nodeWithPos.pos}) + nodeWithPos.node.nodeSize (${nodeWithPos.node.nodeSize}) === from (${from}) + 2`)
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
                    // let posToSelect = -1
                    const state = view.state
                    if (prevState && prevState.doc.eq(state.doc) &&
                        prevState.selection.eq(state.selection)) return false
                    console.log('update', state.selection.anchor)
                    let nodeWithPos = findParentNodeOfType(mySchema.nodes.linkContainer)(view.state.selection)
                    const tr = state.tr
                    disableAll(tr.doc, tr)

                    if (nodeWithPos) {
                      tr.setNodeMarkup(nodeWithPos.pos, undefined, { displayed: true })
                    } else {
                      nodeWithPos = findParentNodeOfType(mySchema.nodes.boldContainer)(view.state.selection)
                      if (nodeWithPos) {
                        // console.log('displayed true', nodeWithPos.pos)
                        tr.setNodeMarkup(nodeWithPos.pos, undefined, { displayed: true })
                        const boldWithPos = findParentNodeOfType(mySchema.nodes.boldText)(view.state.selection)
                        if (boldWithPos) {
                          // console.log('boldWithPos ', boldWithPos)
                        }
                      }
                    }

                    // https://discuss.prosemirror.net/t/how-to-find-node-by-position-not-selection-in-update-handler/3312

                    // if (triggeredByRegex === false) {
                    view.state.doc.descendants((node, pos) => {
                      if (node.type.name === 'text') {
                        nodeWithPos = findParentNodeOfType(mySchema.nodes.boldContainer)(TextSelection.create(view.state.doc, pos, pos))

                        // console.log(node)
                        if (!nodeWithPos) {
                          // console.log('!nodeWithPos ', node.textContent, pos)
                          let matches = node.textContent.matchAll(/(\*\*)(.+)(\*\*)/gi)
                          // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
                          // @ts-ignore
                          matches = Array.from(matches)
                          // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
                          // @ts-ignore
                          matches.forEach(element => {
                            // console.log(`element ${element}`)
                            const newNode = mySchema.node('boldContainer', {}, [
                              mySchema.node('hidden', {}, mySchema.text('**')),
                              mySchema.node('boldText', { text: element[2] }, mySchema.text(element[2])),
                              mySchema.node('hidden', {}, mySchema.text('**'))
                            ])
                            tr.replaceWith(pos + element.index, pos + element.index + element[0].length, newNode)

                            // const resolved = tr.doc.resolve(tr.doc.content.size)
                            // const selection = new Selection(resolved, resolved)
                            // tr.setSelection(selection)
                            // console.log(`set selection to creating node ${selection.anchor} (size before resolving: ${tr.doc.content.size})`)
                          })
                        }
                      }
                    })
                    //   triggeredByRegex = true
                    // } else {
                    //   triggeredByRegex = false
                    // }
                    // if (posToSelect > -1) {
                    //   // posToSelect = 0
                    //   const resolved = tr.doc.resolve(posToSelect)
                    //   console.log('posToSelect ', posToSelect, 'resolved ', resolved)
                    //   view.dispatch(tr.setSelection(new TextSelection(resolved, resolved)))
                    // } else {
                    //   view.dispatch(tr)
                    // }

                    view.dispatch(tr)

                    return false
                  }
                }
              }
            })
          ]
        })
      })

      // const attrs = {
      //   href: 'test',
      //   title: 'test'
      // }
      // viewToGlobalContext = view
      const tr = view.state.tr
      const schema: Schema = view.state.schema
      // const createdNode = schema.node('linkContainer', {}, [
      //   schema.node('hiddenLink', {}, schema.text('[')),
      //   schema.node('link', attrs, schema.text(attrs.title)),
      //   schema.node('hiddenLink', {}, schema.text(']')),
      //   schema.node('hiddenLink', {}, schema.text('(')),
      //   schema.node('hiddenLink', {}, schema.text(attrs.href)),
      //   schema.node('hiddenLink', {}, schema.text(')'))
      // ])
      // const attrs = {
      //   text: 'test'
      // }
      // const createdNode = schema.node('boldContainer', {}, [
      //   schema.node('hidden', {}, schema.text('**')),
      //   schema.node('boldText', attrs, schema.text(attrs.text)),
      //   schema.node('hidden', {}, schema.text('**'))
      // ])
      // tr.replaceWith(1, 1, createdNode)
      // // console.log(createdNode)
      // tr.insertText(' ', 1 + createdNode.nodeSize)
      view.dispatch(tr)
    })

    const buttonClickHandler = () => {
      // console.log(viewToGlobalContext)
    }

    return {
      target,
      buttonClickHandler
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

.bold-container > .hidden {
  display: inline;
  opacity: 0%;
  font-size: 0;
}

.bold-container-displayed > .hidden {
  display: inline;
  opacity: 100%;
  font-size: 16px;
}

.bold-container > .bold-text{
  font-weight: bold;
}

.bold-container-displayed > .bold-text{
  font-weight: normal;
}

</style>
