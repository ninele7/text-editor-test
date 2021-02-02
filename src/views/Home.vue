<template>
  <div class="home">
    <mdEditor class="editor"/>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import mdEditor from '../components/codemirror/mdEditor.vue'

export default defineComponent({
  name: 'Home',
  components: {
    mdEditor
  }
})
</script>

<style lang="scss" scoped>
.editor {
  height: 100vh;
  width: 100vw;
}
</style>
