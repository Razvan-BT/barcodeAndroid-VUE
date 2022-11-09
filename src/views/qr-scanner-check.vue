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
    <div id="send-table-result">
    
    <ion-content id="ion-padding">
      <table style="font-family:Arial;width:100%;border:1px solid #ccc;border-collapse: collapse;color:#667677;">
        <thead style="border:1px solid #ccc;background:#6a9ef2;color:white !important; height:50px;padding:2px;">
          <tr style="border:1px solid #ccc;">
            <th class="string">DateTime</th>
            <th class="string">Order</th>
            <th class="string">Locatie</th>
            <th class="string">Element</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border:1px solid #ccc;" v-for="barcode in barcodeValues" :key="barcode">
            <td style="border:1px solid #ccc;text-align:center;padding:3px;" class="string">{{ barcode.TimeStamp }}</td>
            <td style="border:1px solid #ccc;text-align:center;padding:3px;" class="string">{{ barcode.Order }}</td>
            <td style="border:1px solid #ccc;text-align:center;padding:3px;" class="string">{{ barcode.Locatie }}</td>
            <td style="border:1px solid #ccc;text-align:center;padding:3px;" class="string">{{ barcode.Element }}</td>
          </tr>
        </tbody>
      </table>
    </ion-content>
    </div>
    <!-- <h5 @click="someDebug">Result</h5> -->
  </content-layout>
</template>
  
<script>
// import { onBeforeMount } from 'vue'
import { IonContent } from "@ionic/vue";
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
      barcodeValues: [],
      canShowTable: false,
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

        let sql_query;
        if (this.currentLocation == 'm') {
          this.p1 = 'P';
          this.d1 = 'PIEPT';

          this.p2 = 'M';
          this.d2 = 'MANENCI';
          sql_query = "SELECT * FROM ( SELECT TOP (1), [Order], REPLACE([Locatie], 'LOC ', '') as [Locatie], " + this.code + " as Element FROM `barcode_match` WHERE `Order` = '" + this.code + "' AND `Locatie` = '" + this.d1 + "' AND `Element` = '" + this.p1 + "' ) as tableX ";
          sql_query += "UNION ALL SELECT * FROM ( SELECT TOP (1), [Order], REPLACE([Locatie], 'LOC ', '') as [Locatie], " + this.code + " as Element FROM `barcode_match` WHERE `Order` = '" + this.code + "' AND `Locatie` = '" + this.d2 + "' AND `Element` = '" + this.p2 + "' ) as tableZ";

        } else if (this.currentLocation == 'ch') {
          this.p1 = 'S';
          this.d1 = '';

          this.p2 = '0';
          this.d2 = '';

          sql_query = "SELECT * FROM ( SELECT TOP (1), [Order], REPLACE([Locatie], 'LOC ', '') as [Locatie], " + this.code + " as Element FROM `barcode_match` WHERE `Order` = '" + this.code + "' AND `Locatie` = '" + this.d1 + "' AND `Element` = '" + this.p1 + "' ) as tableX UNION ALL SELECT * FROM ( SELECT * FROM `barcode_match` WHERE `Order` = '" + this.code + "' AND `Locatie` = '" + this.d2 + "' AND `Element` = '" + this.p2 + "' ) as tableZ";

        } else if (this.currentLocation == 'alimentat') {
          this.p1 = 'F';
          this.d1 = 'stofa';

          this.p2 = 'D';
          this.d2 = 'captuseala';

          this.p3 = 'A';
          this.d3 = 'accesorii';

          sql_query = "SELECT * FROM ( SELECT TOP (1), [Order], REPLACE([Locatie], 'LOC ', '') as [Locatie], " + this.code + " as Element FROM `barcode_match` WHERE `Order` = '" + this.code + "' AND `Locatie` = '" + this.d1 + "' AND `Element` = '" + this.p1 + "' ) as tableX ";
          sql_query += "UNION ALL SELECT * FROM ( SELECT TOP (1), [Order], REPLACE([Locatie], 'LOC ', '') as [Locatie], " + this.code + " as Element FROM `barcode_match` WHERE `Order` = '" + this.code + "' AND `Locatie` = '" + this.d2 + "' AND `Element` = '" + this.p2 + "' ) as tableY ";
          sql_query += "UNION ALL SELECT * FROM ( SELECT TOP (1), [Order], REPLACE([Locatie], 'LOC ', '') as [Locatie], " + this.code + " as Element FROM `barcode_match` WHERE `Order` = '" + this.code + "' AND `Locatie` = '" + this.d3 + "' AND `Element` = '" + this.p3 + "' ) as tableZ;";
        }
        await db.query(sql_query)
          .then((res) => {
            Object.entries(res).forEach(([key, value]) => {
              if (key.length > 0) console.log('[debug] key works at qr-scanner');
              if (value.length > 0) {
                /* 
                  Daca totul sa executat corect atunci se va crea un tabel cu Locatia, VTE-ul, Timestampul si Elementul; pentru VTE-ul Y;
                  SELECT * FROM ( SELECT * FROM `barcode_match` WHERE `Order` = 'vte-11' AND `Locatie` = 'd3' AND `Element` = 'stofa' LIMIT 1) as tableXUNION ALL SELECT * FROM ( SELECT * FROM `barcode_match` WHERE `Order` = 'vte-11' AND `Locatie` = 'd3' AND `Element` = 'stofa' LIMIT 1) as tableY --- corect
                  INSERT INTO `barcode_match` (`Order`, `Locatie`, `Element`) VALUES ('vte-11', 'd3', 'stofa'); -- corect
                  CREATE TABLE IF NOT EXISTS `barcode_match` (`TimeStamp` TIMESTAMP NOT NULL DEFAULT current_timestamp, `Order` VARCHAR(100), `Locatie` TEXT(100), `Element` TEXT(100), `Matchpoint` TEXT(100));
                  */
                document.querySelector('#show-data').style.display = 'none';
                this.barcodeValues = value;
                this.createLogs("['" + this.code + "' checked SQL: '" + sql_query + "']");
                sql_query = '';
              } else {
                this.presentToast('Alerta! Nu se poate imperechea pune-l pe raft!');
              }
            })
          })
          .catch((e) => {
            this.createLogs(" [ERROR: ] '" + e + "'");
            alert("qr-scannerd" + e)
          })

        await capLite.closeConnection('barcode_match_db');
        this.checkIfAreValided = false;
      }
      else {
        this.checkIfAreValided = true;
        this.presentToast("This don't start with VTE, so are invalid!");
      }
    },
    async createLogs(logs) {

      const capLite = new SQLiteConnection(CapacitorSQLite);
      const db = await capLite.createConnection("barcode_match_db", 1, false, 'no-encryption', false);

      await db.open(); //TimeStamp TIMESTAMP NOT NULL DEFAULT current_timestamp,

      let db_statement2;
      db_statement2 = "INSERT INTO `barcode_match_logs` (`Logs`) VALUES ('"+logs+"');";
      await db.query(db_statement2)
        .then(() => {
          console.log("LOG inserted!");
          // alert("NR4: inserted!");
        })
        .catch((e) => {
          this.createLogs(" [ERROR: ] '" + e + "'");
          alert("qr-scanner" + e)
        })


      await capLite.closeConnection("barcode_match_db");
    }
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
          alert("qr-scanner" + e)
        })

      if (this.sendRequest) {
        let db_statement;
        db_statement = 'CREATE TABLE IF NOT EXISTS `barcode_match_logs` (`TimeStamp` TIMESTAMP NOT NULL DEFAULT current_timestamp, `Logs` TEXT(200));';
        await db.execute(db_statement)
          .then(() => {
            // alert("NR2: " + JSON.stringify(res));
          })
          .catch((e) => {
            alert("qr-scanner" + e)
          })
        this.logs_created = true;
      }

      if (this.logs_created) {
        let db_statement;
        db_statement = 'SELECT * FROM `barcode_match_logs`';
        await db.query(db_statement)
          .then(() => {
            // alert("NR3: " + JSON.stringify(res));
          })
          .catch((e) => {
            alert("qr-scanner" + e)
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
    IonContent,
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