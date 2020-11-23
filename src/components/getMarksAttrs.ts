export default function getMarkAttrs (state: any, type: any) {
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
