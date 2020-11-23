import { InputRule } from 'prosemirror-inputrules'
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import { schema } from 'prosemirror-markdown'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const markInputRule = (regexp: RegExp, markType: any, getAttrs?: Function) => {
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

export default () => {
  const rules: InputRule[] = []
  rules.push(markInputRule(/(?:\*\*|__)([^*_]+)(?:\*\*|__)$/, schema.marks.strong))
  rules.push(markInputRule(/\[(.*)\]\(.*\)$/, schema.marks.link, (match: RegExpMatchArray) => {
    const matches = match[0].match(/\[(.*)\]\((.*)\)/)
    console.log(matches)
    return {
      title: matches ? matches[0] : '',
      href: matches ? matches[1] : ''
    }
  }))
  return rules
}
