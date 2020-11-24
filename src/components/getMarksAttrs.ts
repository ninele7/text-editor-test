import { ResolvedPos } from 'prosemirror-model'

export function getMarkAttrs (state: any, type: any) {
  const { from, to } = state.selection
  let marks: any = []

  state.doc.nodesBetween(from, to, (node: any) => {
    marks = [...marks, ...node.marks]
  })

  const mark = marks.find((markItem: any) => markItem.type.name === type.name)

  if (mark) {
    return mark.attrs
  }

  return {}
}

export function getMarkRange ($pos: ResolvedPos|null = null, type: any = null) {
  if (!$pos || !type) {
    return false
  }

  const start = $pos.parent.childAfter($pos.parentOffset)

  if (!start.node) {
    return false
  }

  const link = start.node.marks.find((mark) => mark.type === type)
  if (!link) {
    return false
  }

  let startIndex = $pos.index()
  let startPos = $pos.start() + start.offset
  let endIndex = startIndex + 1
  let endPos = startPos + start.node.nodeSize

  while (startIndex > 0 && link.isInSet($pos.parent.child(startIndex - 1).marks)) {
    startIndex -= 1
    startPos -= $pos.parent.child(startIndex).nodeSize
  }

  while (endIndex < $pos.parent.childCount && link.isInSet($pos.parent.child(endIndex).marks)) {
    endPos += $pos.parent.child(endIndex).nodeSize
    endIndex += 1
  }

  return { from: startPos, to: endPos }
}
