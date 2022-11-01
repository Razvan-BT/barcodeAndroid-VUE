<template>
  <content-layout title="Scanning...">
    <div class="">
      <br />

      <div class="">
        <div class="">
          <qrcode-stream @decode="decode" @init="logErrors"></qrcode-stream>
        </div>
      </div>
    </div>
    <h5>Result: {{ qrvalue }}</h5>
  </content-layout>
</template>
  
<script>
import { QrcodeStream } from "vue3-qrcode-reader";

export default {
  setup() { },

  data() {
    const options = [{ text: "nothing (default)", value: undefined }];

    const selected = options[1];
    return {
      options,
      selected,
      qrvalue: "",
    };
  },

  methods: {
    logErrors(promise) {
      promise.catch(console.error);
    },

    decode(decodedString) {
      this.qrvalue = decodedString;
    },
  },

  components: {
    QrcodeStream,
  },
};

</script>
  