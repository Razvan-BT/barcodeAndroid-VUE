<template>
  <content-layout title="Scann">
    <div id="show-data">
      <br />

      <div id="qr-scann">
        <div v-if="this.checkIfAreValided">
          <qrcode-stream @decode="decode" @init="logErrors"></qrcode-stream>
        </div>
      </div>
    </div>
    <div id="send-table-result"></div>
    <!-- <h5 @click="someDebug">Result</h5> -->
  </content-layout>
</template>
  
<script>
import { QrcodeStream } from "vue3-qrcode-reader";
import { toastController } from '@ionic/vue';
import { Preferences } from '@capacitor/preferences';
import axios from 'axios'
// import { ElementTypes } from "@vue/compiler-core";

export default {
  setup() { },

  data() {
    const options = [{ text: "nothing (default)", value: undefined }];

    const selected = options[1];
    return {
      options,
      selected,
      checkIfAreValided: true,
      qrvalue: "",
    };
  },

  methods: {
    // logErrors(promise) {
    //   console.log(promise);
    // },

    removeScanner() {
      document.querySelector("#qr-scann").remove();
    },
    async setLastVTE(lastVte) {
      await Preferences.set({
        key: 'lastVte_scanned',
        value: lastVte
      })
    },
    async presentToast(sendMessage) {
      const toast = await toastController.create({
        message: sendMessage,
        duration: 1500,
        position: 'top'
      });

      await toast.present();
    },
    someDebug() {
      let url = 'https://node.formens.ro/barcode_loc3?order=vte-11&mp=alimentat'
      axios({
        method: 'get',
        url: url
      })
        .then(function (response) {
          console.log("Axios SND", response);
          
          document.querySelector("#send-table-result").innerHTML = response.data;
        });
    },
    async decode(decodedString) {
      this.qrvalue = decodedString.toUpperCase();
      const code = decodedString.toUpperCase();
      if (code.includes("VTE-")) {
        this.removeScanner();
        this.presentToast(`${code} scanned!`);
        this.setLastVTE(code);


        let url = `https://node.formens.ro/barcode_loc3?order=${decodedString}&mp=alimentat`
        axios({
          method: 'get',
          url: url
        })
          .then(function (response) {
            console.log(response);
            document.querySelector("#send-table-result").innerHTML = response.data;
            
          });
        this.checkIfAreValided = false;
      }
      else {
        this.checkIfAreValided = true;
        this.presentToast("This don't start with VTE, so are invalid!");
      }
    },

  },

  components: {
    QrcodeStream,

  },
};

</script>


<style scoped>
#send-table-result {
  color: black;
}

th {
    background-color: var(--ion-color-success-tint);
    color: black;
}

</style>