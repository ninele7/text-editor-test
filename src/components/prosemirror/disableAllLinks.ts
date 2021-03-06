import { Node } from 'prosemirror-model'
import { Transaction } from 'prosemirror-state'
import { mySchema } from './createReplaceRules'
import { flatten } from 'prosemirror-utils'

export default function disableAll (node: Node, tr: Transaction) {
  flatten(node).forEach((nodeWithPos) => {
    if (nodeWithPos.node.type === mySchema.nodes.linkContainer ||
      nodeWithPos.node.type === mySchema.nodes.boldContainer) {
      tr.setNodeMarkup(nodeWithPos.pos, undefined, { displayed: false })
    }
  })
}
