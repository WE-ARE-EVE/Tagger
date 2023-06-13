<template>
  <pre v-if="loaded">
    <code ref="code" v-html="highlightedCode" :class="language" />
  </pre>
</template>

<script>
import Prism from 'prismjs'
import 'prismjs/components/prism-python'


export default {
    props: {
        code: {
            type: String,
            required: true
        },
        language: {
            type: String,
            required: true
        }
    },
    data() {
        return {
            loaded: false,
            highlightedCode: ''
        }
    },
    mounted() {
        this.loaded = true
        this.highlight()
    },
    watch: {
        code: 'highlight',
        language: 'highlight'
    },
    methods: {
        highlight() {
            this.highlightedCode = Prism.highlight(this.code, Prism.languages[this.language], this.language)
        }
    }
}
</script>
