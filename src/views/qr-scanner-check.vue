<template>
  <content-layout title="Cauta dupa QR code">
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
// import { onBeforeMount } from 'vue'
import { QrcodeStream } from "vue3-qrcode-reader";
import { toastController } from '@ionic/vue';
import { Preferences } from '@capacitor/preferences';
import { CapacitorSQLite, SQLiteConnection } from '@capacitor-community/sqlite'
// import { ElementTypes } from "@vue/compiler-core";

export default {
  setup() { },

  data() {
    // const getFiltersFromData = (data) => {
    //   return data.reduce((out, obj) => {
    //     Object.keys(obj).forEach(k => {
    //       if (out[k] === undefined) out[k] = [obj[k]];             //Array doesn't exist yet - instantiate it
    //       else if (!out[k].includes(obj[k])) out[k].push(obj[k]);  //Array exists and this value isn't in it - add the value to it
    //     });
    //     return out;
    //   }, {});
    // };

    const options = [{ text: "nothing (default)", value: undefined }];

    const selected = options[1];
    return {
      options,
      selected,
      p1: '',
      d1: '',
      p2: '',
      d2: '',
      p3: '',
      d3: '',
      connectionDb: {},
      logs_created: false,
      sendRequest: false,
      currentLocation: '',
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
        duration: 5000,
        position: 'top'
      });

      await toast.present();
    },
    async decode(decodedString) {

      this.qrvalue = decodedString.toUpperCase();
      const code = decodedString.toUpperCase();
      if (code.includes("VTE-")) {
        this.removeScanner();
        this.presentToast(`${code} scanned!`);
        this.setLastVTE(code);

        const { valuee } = await Preferences.get({ key: 'location' });
        this.currentLocation = `${valuee}`;

        const capLite = new SQLiteConnection(CapacitorSQLite);
        const db = await capLite.createConnection("barcode_match_db", 1, false, 'no-encryption', false);

        await db.open(); //TimeStamp TIMESTAMP NOT NULL DEFAULT current_timestamp,

        let sql_query, numarElemente = 2;
        if(this.currentLocation == 'm') {
          this.p1 = 'P';
          this.d1 = 'PIEPT';

          this.p2 = 'M';
          this.d2 = 'MANENCI';

        } else if(this.currentLocation == 'ch') {
          this.p1 = 'S';
          this.d1 = '';

          this.p2 = '0';
          this.d2 = '';

        } else if(this.currentLocation == 'alimentat') {
          this.p1 = 'F';
          this.d1 = 'stofa';

          this.p2 = 'D';
          this.d2 = 'captuseala';

          this.p3 = 'A';
          this.d3 = 'accesorii';

          numarElemente = 3;
        }
        sql_query = "SELECT * FROM `barcode_match` WHERE `Order` = '" + this.code + "' AND `Element` = '" + this.p1 + "'";
        if(numarElemente == 3) sql_query = sql_query + "UNION ALL SELECT * FROM `barcode_match` WHERE `Order` = '" + this.code + "' AND `Element` = '" + this.p3 + "'";
        await db.query(sql_query)
          .then((res) => {
            Object.entries(res).forEach(([key, value]) => {
              if (key.length > 0) console.log('[debug] key works at qr-scanner');
              if (value.length > 0) {
                // alert('test : ' + value[0]);
              } else {
                this.presentToast('Alerta! Nu se poate imperechea pune-l pe raft!');
              }
            })
          })
          .catch((e) => {
            alert(e);
          })
        
        await capLite.closeConnection('barcode_match_db');
        this.checkIfAreValided = false;
      }
      else {
        this.checkIfAreValided = true;
        this.presentToast("This don't start with VTE, so are invalid!");
      }
    },

  },
  async beforeMount() {
    try { // create connection to App with DB
      const capLite = new SQLiteConnection(CapacitorSQLite);
      const db = await capLite.createConnection("barcode_match_db", 1, false, 'no-encryption', false);

      await db.open(); //TimeStamp TIMESTAMP NOT NULL DEFAULT current_timestamp,

      this.connectionDb = db;

      let db_statement;
      db_statement = 'CREATE TABLE IF NOT EXISTS `barcode_match` (`TimeStamp` TIMESTAMP NOT NULL DEFAULT current_timestamp, `Order` TEXT(100), `Locatie` TEXT(100), `Element` TEXT(100), `Matchpoint` TEXT(100));';
      await db.execute(db_statement)
        .then(() => {
          // alert("NR1: " + JSON.stringify(res));
          this.sendRequest = true;
        })
        .catch((e) => {
          alert(e);
        })

      if (this.sendRequest) {
        let db_statement;
        db_statement = 'CREATE TABLE IF NOT EXISTS `barcode_match_logs` (`TimeStamp` TIMESTAMP NOT NULL DEFAULT current_timestamp, `Logs` TEXT(200));';
        await db.execute(db_statement)
          .then(() => {
            // alert("NR2: " + JSON.stringify(res));
          })
          .catch((e) => {
            alert(e);
          })
        this.logs_created = true;
      }

      let db_statement2;
      db_statement2 = "INSERT INTO `barcode_match_logs` (Logs) VALUES ('Acesta este un test.');";
      await db.query(db_statement2)
        .then(() => {
          // alert("NR4: inserted!");
        })
        .catch((e) => {
          alert(e);
        })

      if (this.logs_created) {
        let db_statement;
        db_statement = 'SELECT * FROM `barcode_match_logs`';
        await db.query(db_statement)
          .then(() => {
            // alert("NR3: " + JSON.stringify(res));
          })
          .catch((e) => {
            alert(e);
          })
      }

      await capLite.closeConnection('barcode_match_db');
    }
    catch (e) {
      alert(e);
    }
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