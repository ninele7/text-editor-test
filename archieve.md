                      matches.forEach(element => {
                        // console.log('view.state.doc.firstChild', view.state.doc.firstChild)
                        // console.log('view.state.doc.nodeAt(pos)', view.state.doc.nodeAt(element.index))
                        // console.log('view.state.doc.resolve(pos).parent', view.state.doc.resolve(element.index).parent)
                        // console.log(element)
                        // const resolved = tr.doc.resolve(element.index)
                        // console.log(resolved)
                        // const selection = new TextSelection(resolved)
                        // const nodeWithPos = findParentNodeOfType(mySchema.nodes.boldContainer)(selection)
                        // console.log(selection)
                        // if (!nodeWithPos) {
                        //   tr.replaceWith(element.index, element.index + element[0].length + 1, mySchema.node('boldContainer', {}, [
                        //     mySchema.node('hidden', {}, mySchema.text('**')),
                        //     mySchema.node('boldText', { text: element[2] }, mySchema.text(element[2])),
                        //     mySchema.node('hidden', {}, mySchema.text('**'))
                        //   ]))

                        //   triggeredByRegex = true
                        // }
                      })
                    // } else {
                    //   triggeredByRegex = false
                    // }