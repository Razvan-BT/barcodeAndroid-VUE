<template>
  <content-layout title="Cauta dupa QR code">
    <ion-content id="ion-padding">
      <div id="show-data">
        <br />

        <div id="qr-scann">
          <div v-if="this.checkIfAreValided">
            <qrcode-stream @decode="decode" @init="logErrors"></qrcode-stream>
          </div>
        </div>
      </div>
      <div id="send-result"></div>
      <table v-if="this.barcodeValues.length > 0" style="font-family:Arial;width:100%;border:1px solid #ccc;border-collapse: collapse;color:#667677;">
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
            <td style="border:1px solid #ccc;text-align:center;padding:3px;" class="string">{{ barcode.TimeStamp }}
            </td>
            <td style="border:1px solid #ccc;text-align:center;padding:3px;" class="string">{{ barcode.Order }}</td>
            <td style="border:1px solid #ccc;text-align:center;padding:3px;" class="string">{{ barcode.Locatie }}</td>
            <td style="border:1px solid #ccc;text-align:center;padding:3px;" class="string">{{ barcode.Element }}</td>
          </tr>
        </tbody>
      </table>
    </ion-content>

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

    const options = [{ text: "nothing (default)", value: undefined }];

    const selected = options[1];
    return {
      currentLocation: '',
      barcodeValues: [],
      options,
      selected,
      p1: '',
      d1: '',
      p2: '',
      d2: '',
      p3: '',
      d3: '',
      loc: 2,
      sendRequest: false,
      locatie_material: '',
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

      if (this.currentLocation != '' && this.currentLocation != 'null') {

        this.qrvalue = decodedString.toUpperCase();
        const code = decodedString.toUpperCase();
        if (code.includes("VTE-")) {
          this.setLastVTE(code);

          const capLite = new SQLiteConnection(CapacitorSQLite);
          const db = await capLite.createConnection("barcode_match_db", 1, false, 'no-encryption', false);

          await db.open(); //TimeStamp TIMESTAMP NOT NULL DEFAULT current_timestamp,

          let sql_query;
          if (this.currentLocation == 'm') {
            this.p1 = 'P';
            this.d1 = 'PIEPT';

            this.p2 = 'M';
            this.d2 = 'MANENCI';

            this.locatie_material = "AND [Matchpoint] = 'm'";

            sql_query = "SELECT * FROM ( SELECT [TimeStamp] ,[Order] ,REPLACE([Locatie], 'LOC ', '') as [Locatie] ,'" + this.d1 + "' as Element FROM barcode_match where [Order] = '" + this.qrvalue + "' and Element = '" + this.p1 + "' " + this.locatie_material + " order by TimeStamp desc LIMIT 1 ) as tableA";
            sql_query += " UNION ALL SELECT * FROM ( SELECT [TimeStamp] ,[Order] ,REPLACE([Locatie], 'LOC ', '') as [Locatie] ,'" + this.d2 + "' as Element FROM barcode_match where [Order] = '" + this.qrvalue + "' and Element = '" + this.p2 + "' " + this.locatie_material + " order by TimeStamp desc LIMIT 1 ) as tableB;";


          } else if (this.currentLocation == 'ch') {
            this.p1 = 'S';
            this.d1 = '';

            this.p2 = '0';
            this.d2 = '';

            this.locatie_material = "AND [Matchpoint] = 'ch'";


            sql_query = "SELECT * FROM ( SELECT [TimeStamp] ,[Order] ,REPLACE([Locatie], 'LOC ', '') as [Locatie] ,'" + this.d1 + "' as Element FROM barcode_match where [Order] = '" + this.qrvalue + "' and Element = '" + this.p1 + "' " + this.locatie_material + " order by TimeStamp desc LIMIT 1 ) as tableA";
            sql_query += " UNION ALL SELECT * FROM ( SELECT [TimeStamp] ,[Order] ,REPLACE([Locatie], 'LOC ', '') as [Locatie] ,'" + this.d2 + "' as Element FROM barcode_match where [Order] = '" + this.qrvalue + "' and Element = '" + this.p2 + "' " + this.locatie_material + " order by TimeStamp desc LIMIT 1 ) as tableB;";

          } else if (this.currentLocation == 'alimentat') {
            this.p1 = 'F';
            this.d1 = 'stofa';

            this.p2 = 'D';
            this.d2 = 'captuseala';

            this.p3 = 'A';
            this.d3 = 'accesorii';

            this.locatie_material = "AND [Matchpoint] = 'alimentat'";

            sql_query = "SELECT * FROM ( SELECT [TimeStamp] ,[Order] ,REPLACE([Locatie], 'LOC ', '') as [Locatie] ,'" + this.d1 + "' as Element FROM barcode_match where [Order] = '" + this.qrvalue + "' and Element = '" + this.p1 + "' " + this.locatie_material + " order by TimeStamp desc LIMIT 1 ) as tableA ";
            sql_query += "UNION ALL SELECT * FROM ( SELECT [TimeStamp] ,[Order] ,REPLACE([Locatie], 'LOC ', '') as [Locatie] ,'" + this.d2 + "' as Element FROM barcode_match where [Order] = '" + this.qrvalue + "' and Element = '" + this.p2 + "' " + this.locatie_material + " order by TimeStamp desc LIMIT 1 ) as tableB ";
            sql_query += "UNION ALL SELECT * FROM ( SELECT [TimeStamp] ,[Order] ,REPLACE([Locatie], 'LOC ', '') as [Locatie] ,'" + this.d3 + "' as Element FROM barcode_match where [Order] = '" + this.qrvalue + "' and Element = '" + this.p3 + "' " + this.locatie_material + " order by TimeStamp desc LIMIT 1 ) as tableC;";
          } else {
            this.p1 = 'C'; // c
            this.d1 = 'PIEPTI';

            this.p2 = 'X'; // x
            this.d2 = 'CAPTUSEALA';

            sql_query = "SELECT * FROM ( SELECT [TimeStamp] ,[Order] ,REPLACE([Locatie], 'LOC ', '') as [Locatie] ,'" + this.d1 + "' as Element FROM barcode_match where [Order] = '" + this.qrvalue + "' and Element = '" + this.p1 + "' order by TimeStamp desc LIMIT 1 ) as tableA";
            sql_query += " UNION ALL SELECT * FROM ( SELECT [TimeStamp] ,[Order] ,REPLACE([Locatie], 'LOC ', '') as [Locatie] ,'" + this.d2 + "' as Element FROM barcode_match where [Order] = '" + this.qrvalue + "' and Element = '" + this.p2 + "' order by TimeStamp desc LIMIT 1 ) as tableB;";

          }

          await db.query(sql_query)
            .then((res) => {
              Object.entries(res).forEach(([key, value]) => {
                if (key.length > 0) console.log('[debug] key works at qr-scanner');
                if (value.length > 0) {
                  this.barcodeValues = value;
                  document.querySelector('#show-data').style.display = 'none';
                  document.querySelector('#send-result').innerHTML = "Este pe raft: ";

                  this.removeScanner(); // remove scanner after showing data
                } else {
                  this.presentToast(`Alerta! Nu se poate imperechea pune-l pe raft!`);
                }
              })
            })
            .catch((e) => {
              this.createLogs(" [ERROR: ] '" + e + "'");
              alert("qr-scannerd" + e)
            })

          await capLite.closeConnection('barcode_match_db');
        }
        else {
          this.checkIfAreValided = true;
          this.presentToast("Selecteaza prima data locatia!");
        }
      }
      else {
        this.checkIfAreValided = true;
        this.presentToast("This don't start with VTE, so are invalid!");
      }
    },
    async getLoc() {
      const { value } = await Preferences.get({ key: 'location' });
      this.currentLocation = `${value}`;
    },
    async createLogs(logs) {

      const capLite = new SQLiteConnection(CapacitorSQLite);
      const db = await capLite.createConnection("barcode_match_db", 1, false, 'no-encryption', false);

      await db.open(); //TimeStamp TIMESTAMP NOT NULL DEFAULT current_timestamp,

      let db_statement2;
      db_statement2 = "INSERT INTO `barcode_match_logs` (`Logs`) VALUES ('" + logs + "');";
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
    this.getLoc();
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
#send-result {
  font-size: 20px;
  color: green;
  font-weight: 500;
}
</style>