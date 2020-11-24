import { InputRule } from 'prosemirror-inputrules'
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import { schema } from 'prosemirror-markdown'
import { Mark, MarkType, NodeType, Node, Schema } from 'prosemirror-model'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const markInputRule = (regexp: RegExp, markType: MarkType, getAttrs?: Function) => {
  const newRegexp = new RegExp(regexp.source.replace(/\$$/, '') + '(.)' + '$')

  return new InputRule(newRegexp, (state, match, start, end) => {
    const attrs = getAttrs instanceof Function ? getAttrs(match) : getAttrs
    const textStart = start + match[0].indexOf(match[1])
    const textEnd = textStart + match[1].length
    const tr = state.tr

    start = (match[0].match(/^\s/)) ? start + 1 : start

    if (textEnd < end) tr.delete(textEnd, end)
    if (textStart > start) tr.delete(start, textStart)

    end = start + match[1].length

    return tr
      .addMark(start, end, markType.create(attrs))
      .insert(end, schema.text(match[2]))
  })
}

const replaceWithNodeInputRule = (regexp: RegExp, markType: NodeType, getAttrs? : Function) => {
  const newRegexp = new RegExp(regexp.source.replace(/\$$/, '') + '(.)' + '$')

  return new InputRule(newRegexp, (state, match, start, end) => {
    const attrs = getAttrs instanceof Function ? getAttrs(match) : getAttrs
    const textStart = start + match[0].indexOf(match[1])
    const textEnd = textStart + match[1].length
    const tr = state.tr

    start = (match[0].match(/^\s/)) ? start + 1 : start

    if (textEnd < end) tr.delete(textEnd, end)
    if (textStart > start) tr.delete(start, textStart)

    end = start + match[1].length
    const createdNode = state.schema.node('linkContainer', {}, [
      state.schema.node('hiddenLink', {}, state.schema.text('[')),
      state.schema.node('link', attrs, state.schema.text(attrs.title)),
      state.schema.node('hiddenLink', {}, state.schema.text(']')),
      state.schema.node('hiddenLink', {}, state.schema.text('(')),
      state.schema.node('hiddenLink', attrs, state.schema.text(attrs.href)),
      state.schema.node('hiddenLink', {}, state.schema.text(')'))
    ])
    return tr.replaceWith(start, end, createdNode)
  })
}

export const rules: InputRule[] = []

// schema.marks.link.spec.toDOM = (node: Mark) => {
//   const elem = document.createElement('a')
//   elem.title = node.attrs.title
//   elem.href = node.attrs.href
//   return elem
// }
console.log(schema.spec.nodes)
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
export const mySchema = new Schema({
  nodes: schema.spec.nodes.addToEnd('link', {
    attrs: { href: { default: null }, title: { default: null } },
    content: 'text*',
    group: 'inline',
    inline: true,
    toDOM (node: Node) {
      return ['a', node.attrs, 0]
    }
  }).addToEnd('linkContainer', {
    attrs: { displayed: { default: false } },
    content: '(hiddenLink | link)*',
    group: 'inline',
    inline: true,
    toDOM (node: Node) {
      return ['span', {
        class: 'link-container' + (node.attrs.displayed ? ' link-container-displayed' : '')
      }, 0]
    }
  }).addToEnd('hiddenLink', {
    content: '(text | link)*',
    group: 'inline',
    inline: true,
    toDOM () {
      return ['span', { class: 'hidden-link' }, 0]
    }
  }),
  marks: schema.spec.marks.remove('link')
})

export default () => {
  rules.push(markInputRule(/(?:\*\*|__)([^*_]+)(?:\*\*|__)$/, schema.marks.strong))
  rules.push(replaceWithNodeInputRule(/\[(.*)\]\(.*\)/, mySchema.nodes.link, (match: RegExpMatchArray) => {
    const matches = match[0].match(/\[(.*)\]\((.*)\)/)
    return {
      title: matches ? matches[1] : '',
      href: matches ? matches[2] : ''
    }
  }))
  return rules
}
