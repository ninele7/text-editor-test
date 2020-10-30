<template>
  <div>
    <textarea ref="mdEditor" @key="Math.random()">

    </textarea>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import * as HyperMd from 'hypermd'
import { Editor } from 'codemirror'

export default defineComponent({
  name: 'Home',
  data () {
    return {
      editor: null as (Editor | null)
    }
  },

  mounted () {
    const textarea = this.$refs.mdEditor as HTMLTextAreaElement
    this.editor = HyperMd.fromTextArea(textarea)
    this.editor.setSize('100%', '100%')
  }
})
</script>

<style lang="scss" scoped>

</style>
