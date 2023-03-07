<template>
  <content-layout title="Barcode">
    <ion-card color="light">
      <ion-card-header>
        <div id="button-desing">
          <ion-button @click="buttonCauta"> Cauta </ion-button>
          <ion-button @click="buttonComplet">
            <!-- barcode_match3?mp=alimentat -->
            Complet
          </ion-button>
          <ion-button @click="buttonVerifica">
            <!-- barcode_ck3?loc=LOC C-3&mp=alimentat -->
            Verifica
          </ion-button>
          <ion-button @click="buttonInventar"> Inventar </ion-button>
        </div>
        <h3
          v-if="
            this.stare == 'adauga_vte_in_locatie' && this.valLocatie.length > 0
          "
        >
          {{ this.valLocatie }}
        </h3>
        <h3 id="output" v-if="this.output.length > 0">{{ this.output }}</h3>

        <table
          v-if="this.valoareSQL.length > 0 && this.stare == 'cauta'"
          style="
            font-family: Arial;
            width: 100%;
            border: 1px solid #ccc;
            border-collapse: collapse;
            color: #667677;
          "
        >
          <thead
            style="
              border: 1px solid #ccc;
              background: #6a9ef2;
              color: white !important;
              height: 50px;
              padding: 2px;
            "
          >
            <tr style="border: 1px solid #ccc">
              <th class="string">DateTime</th>
              <th class="string">Order</th>
              <th class="string">Locatie</th>
              <th class="string">Element</th>
            </tr>
          </thead>
          <tbody>
            <tr
              style="border: 1px solid #ccc"
              v-for="barcode in valoareSQL"
              :key="barcode"
            >
              <td
                style="border: 1px solid #ccc; text-align: center; padding: 3px"
                class="string"
              >
                {{ barcode.TimeStamp }}
              </td>
              <td
                style="border: 1px solid #ccc; text-align: center; padding: 3px"
                class="string"
              >
                {{ barcode.Order }}
              </td>
              <td
                style="border: 1px solid #ccc; text-align: center; padding: 3px"
                class="string"
              >
                {{ barcode.Locatie }}
              </td>
              <td
                style="border: 1px solid #ccc; text-align: center; padding: 3px"
                class="string"
              >
                {{ barcode.Element }}
              </td>
            </tr>
          </tbody>
        </table>

        <!-- tabel la complet -->

        <table
          v-if="
            this.valoareSQL.length > 0 &&
            this.stare == 'complet' &&
            this.isComplete == true
          "
          style="
            font-family: Arial;
            width: 100%;
            border: 1px solid #ccc;
            border-collapse: collapse;
            color: #667677;
          "
        >
          <thead
            style="
              border: 1px solid #ccc;
              background: #6a9ef2;
              color: white !important;
              height: 50px;
              padding: 2px;
            "
          >
            <tr style="border: 1px solid #ccc">
              <th class="string">Order</th>
              <th class="string">Locatie {{ this.d1 }}</th>
              <th class="string">Locatie {{ this.d2 }}</th>
              <th v-if="this.d3.length > 0" class="string">
                Locatie {{ this.d3 }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              style="border: 1px solid #ccc"
              v-for="barcode in valoareSQL"
              :key="barcode"
            >
              <td
                style="border: 1px solid #ccc; text-align: center; padding: 3px"
                class="string"
              >
                {{ barcode.Order }}
              </td>
              <td
                style="border: 1px solid #ccc; text-align: center; padding: 3px"
                class="string"
              >
                {{ barcode.locOne }}
              </td>
              <td
                style="border: 1px solid #ccc; text-align: center; padding: 3px"
                class="string"
              >
                {{ barcode.locTwo }}
              </td>
              <td
                v-if="this.d3.length > 0"
                style="border: 1px solid #ccc; text-align: center; padding: 3px"
                class="string"
              >
                {{ barcode.locThree }}
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Verifica table -->

        <table
          v-if="this.valoareSQL.length > 0 && this.stare == 'verifica'"
          style="
            font-family: Arial;
            width: 100%;
            border: 1px solid #ccc;
            border-collapse: collapse;
            color: #667677;
          "
        >
          <thead
            style="
              border: 1px solid #ccc;
              background: #6a9ef2;
              color: white !important;
              height: 50px;
              padding: 2px;
            "
          >
            <tr style="border: 1px solid #ccc">
              <th class="string">Order</th>
            </tr>
          </thead>
          <tbody>
            <tr
              style="border: 1px solid #ccc"
              v-for="barcode in valoareSQL"
              :key="barcode"
            >
              <td
                style="border: 1px solid #ccc; text-align: center; padding: 3px"
                class="string"
              >
                {{ barcode.Order }}
              </td>
            </tr>
          </tbody>
        </table>
      </ion-card-header>
      <ion-card-content>
        <ion-button expand="full" @click="globalForLoop">Scaneaza</ion-button>
      </ion-card-content>
      <div v-if="this.startScann" id="qr-scann">
        <qrcode-stream @decode="decode" @init="logErrors"></qrcode-stream>
      </div>
    </ion-card>
  </content-layout>
</template>

<script>
import { QrcodeStream } from "vue3-qrcode-reader";
import { IonCard, IonCardHeader, IonCardContent, IonButton } from "@ionic/vue";
import { defineComponent } from "vue";
import { Preferences } from "@capacitor/preferences";
import { CapacitorSQLite, SQLiteConnection } from "@capacitor-community/sqlite";

export default defineComponent({
  data() {
    return {
      currentLocation: "",
      locatie: "",
      valLocatie: "",
      valoareSQL: [],
      dataTable: [],
      verificaTable: [],
      valVte: "",
      startScann: false,
      output: "",
      stare: "",
      p1: "",
      d1: "",
      p2: "",
      d2: "",
      p3: "",
      d3: "",
      loc: 2,
      locatie_material: "",
      codeQr: "",
      checkIfAreValided: true,
      sendVTEForAdd: false,
      sendRequest: false,
      isComplete: false, // daca este complet. true
      valoareOfInput_loc: "",
    };
  },
  components: {
    IonCard,
    IonCardHeader,
    IonButton,
    IonCardContent,
    QrcodeStream,
  },
  methods: {

    async decode(codeQrScanned) {
      const capLite = new SQLiteConnection(CapacitorSQLite);
      const db = await capLite.createConnection(
        "barcode_match_db",
        1,
        false,
        "no-encryption",
        false
      );
      await db.open();
      if (codeQrScanned.startsWith("https")) {
        this.codeQr =
          codeQrScanned.replace("https://node.formens.ro/q/", "") + "V";
        this.codeQr = "V" + this.codeQr;
      } else this.codeQr = codeQrScanned;

      if (this.currentLocation != "" && this.currentLocation != "null") {
        if (this.stare == "cauta") {
          if (this.codeQr.startsWith("VTE-")) {
            if (this.stare != "adauga_vte_in_locatie") {
              let sql_query;
              if (this.currentLocation == "m") {
                this.p1 = "P";
                this.d1 = "PIEPT";

                this.p2 = "M";
                this.d2 = "MANENCI";

                this.locatie_material = "AND [Matchpoint] = 'm'";

                sql_query =
                  "SELECT * FROM ( SELECT [TimeStamp] ,[Order] ,REPLACE([Locatie], 'LOC ', '') as [Locatie] ,'" +
                  this.d1 +
                  "' as Element FROM barcode_match where [Order] = '" +
                  this.codeQr.toUpperCase() +
                  "' and Element = '" +
                  this.p1 +
                  "' " +
                  this.locatie_material +
                  " order by TimeStamp desc LIMIT 1 ) as tableA";
                sql_query +=
                  " UNION ALL SELECT * FROM ( SELECT [TimeStamp] ,[Order] ,REPLACE([Locatie], 'LOC ', '') as [Locatie] ,'" +
                  this.d2 +
                  "' as Element FROM barcode_match where [Order] = '" +
                  this.codeQr.toUpperCase() +
                  "' and Element = '" +
                  this.p2 +
                  "' " +
                  this.locatie_material +
                  " order by TimeStamp desc LIMIT 1 ) as tableB;";
              } else if (this.currentLocation == "ch") {
                this.p1 = "S";
                this.d1 = "";

                this.p2 = "0";
                this.d2 = "";

                this.locatie_material = "AND [Matchpoint] = 'ch'";

                sql_query =
                  "SELECT * FROM ( SELECT [TimeStamp] ,[Order] ,REPLACE([Locatie], 'LOC ', '') as [Locatie] ,'" +
                  this.d1 +
                  "' as Element FROM barcode_match where [Order] = '" +
                  this.codeQr.toUpperCase() +
                  "' and Element = '" +
                  this.p1 +
                  "' " +
                  this.locatie_material +
                  " order by TimeStamp desc LIMIT 1 ) as tableA";
                sql_query +=
                  " UNION ALL SELECT * FROM ( SELECT [TimeStamp] ,[Order] ,REPLACE([Locatie], 'LOC ', '') as [Locatie] ,'" +
                  this.d2 +
                  "' as Element FROM barcode_match where [Order] = '" +
                  this.codeQr.toUpperCase() +
                  "' and Element = '" +
                  this.p2 +
                  "' " +
                  this.locatie_material +
                  " order by TimeStamp desc LIMIT 1 ) as tableB;";
              } else if (this.currentLocation == "alimentat") {
                this.p1 = "F";
                this.d1 = "stofa";

                this.p2 = "D";
                this.d2 = "captuseala";

                this.p3 = "A";
                this.d3 = "accesorii";

                this.locatie_material = "AND [Matchpoint] = 'alimentat'";

                sql_query =
                  "SELECT * FROM ( SELECT [TimeStamp] ,[Order] ,REPLACE([Locatie], 'LOC ', '') as [Locatie] ,'" +
                  this.d1 +
                  "' as Element FROM barcode_match where [Order] = '" +
                  this.codeQr.toUpperCase() +
                  "' and Element = '" +
                  this.p1 +
                  "' " +
                  this.locatie_material +
                  " order by TimeStamp desc LIMIT 1 ) as tableA ";
                sql_query +=
                  "UNION ALL SELECT * FROM ( SELECT [TimeStamp] ,[Order] ,REPLACE([Locatie], 'LOC ', '') as [Locatie] ,'" +
                  this.d2 +
                  "' as Element FROM barcode_match where [Order] = '" +
                  this.codeQr.toUpperCase() +
                  "' and Element = '" +
                  this.p2 +
                  "' " +
                  this.locatie_material +
                  " order by TimeStamp desc LIMIT 1 ) as tableB ";
                sql_query +=
                  "UNION ALL SELECT * FROM ( SELECT [TimeStamp] ,[Order] ,REPLACE([Locatie], 'LOC ', '') as [Locatie] ,'" +
                  this.d3 +
                  "' as Element FROM barcode_match where [Order] = '" +
                  this.codeQr.toUpperCase() +
                  "' and Element = '" +
                  this.p3 +
                  "' " +
                  this.locatie_material +
                  " order by TimeStamp desc LIMIT 1 ) as tableC;";
              } else {
                this.p1 = "C"; // c
                this.d1 = "PIEPTI";

                this.p2 = "X"; // x
                this.d2 = "CAPTUSEALA";

                sql_query =
                  "SELECT * FROM ( SELECT [TimeStamp] ,[Order] ,REPLACE([Locatie], 'LOC ', '') as [Locatie] ,'" +
                  this.d1 +
                  "' as Element FROM barcode_match where [Order] = '" +
                  this.codeQr.toUpperCase() +
                  "' and Element = '" +
                  this.p1 +
                  "' order by TimeStamp desc LIMIT 1 ) as tableA";
                sql_query +=
                  " UNION ALL SELECT * FROM ( SELECT [TimeStamp] ,[Order] ,REPLACE([Locatie], 'LOC ', '') as [Locatie] ,'" +
                  this.d2 +
                  "' as Element FROM barcode_match where [Order] = '" +
                  this.codeQr.toUpperCase() +
                  "' and Element = '" +
                  this.p2 +
                  "' order by TimeStamp desc LIMIT 1 ) as tableB;";
              }

              await db
                .query(sql_query)
                .then((res) => {
                  Object.entries(res).forEach(([key, value]) => {
                    if (key.length > 0)
                      console.log("[debug] key works at qr-scanner");
                    if (value.length > 0) {
                      // this.stare = "locatie";
                      // this.saveVteInLocatie();

                      this.output = "Este pe raft: ";
                      document.querySelector("#output").style.color = "green";

                      this.valoareSQL = value;
                      this.startScann = false;
                    } else {
                      this.stare = "locatie";
                      this.startScann = false;

                      this.output = "Nu se poate imperechea. Pune-l pe raft!";
                      document.querySelector("#output").style.color = "red";
                    }
                  });
                })
                .catch((e) => {
                  alert(e);
                });
            }
          }
        } else if (this.stare == "locatie") {
          this.valLocatie = this.codeQr.toUpperCase();
          if (this.valLocatie.startsWith("LOC ")) {
            this.startScann = false;
            this.stare = "adauga_vte_in_locatie";

            // daca locatia este valida atunci voi rescana un dosar.
          } else {
            this.startScann = false;
            this.stare = "";
          }
          // Opreste camera dupa ce am scanat si locatia
          // ca sa adaug dupa comanda in dosar.
        } else if (this.stare == "adauga_vte_in_locatie") {
          let dataNow = new Date().toLocaleString("en-GB");
          if (this.codeQr.startsWith("VTE-")) {
            await db
              .query(
                "INSERT INTO `barcode_match` (`TimeStamp`, `Order`, `Locatie`, `Element`, `Matchpoint`) VALUES ('" +
                  dataNow +
                  "', '" +
                  this.codeQr +
                  "', '" +
                  this.valLocatie +
                  "', '" +
                  this.valLocatie.split(" ").pop().split("-")[0] +
                  "', '" +
                  this.currentLocation +
                  "');"
              )
              .then(() => {
                this.output =
                  "" +
                  this.codeQr +
                  " a fost adaugat in locatia " +
                  this.valLocatie.replace("LOC ", "") +
                  "";
                document.querySelector("#output").style.color = "green";
                this.startScann = false;
                this.stare = "";
              })
              .catch((e) => {
                alert(e);
              });
          } else {
            this.startScann = false;
            this.stare = "";
          }
        } else if (this.stare == "verifica") {
          if (this.codeQr.toUpperCase().startsWith("LOC ")) {
            await db
              .query(
                "SELECT * FROM `barcode_match` WHERE `Locatie` = '" +
                  this.codeQr.toUpperCase() +
                  "' AND `Matchpoint` = '" +
                  this.currentLocation +
                  "';"
              )
              .then((e) => {
                Object.entries(e).forEach(([key, value]) => {
                  if (key.length) console.log("[debug]");
                  if (value.length > 0) {
                    this.valoareSQL = value;

                    this.startScann = false; // Opresc camera.
                  } else {
                    this.output = "Locatie specificata invalida.";
                    this.startScann = false;
                    this.stare = "";
                  }
                });
              })
              .catch((e) => {
                alert(e);
              });
          } else {
            this.startScann = false;
            this.stare = "";
          }
        } else if (this.stare == "inventar") {
          if (this.codeQr.startsWith("LOC ")) {
            this.valoareOfInput_loc = this.codeQr.toUpperCase();
            if (this.sendVTEForAdd == false) {
              await db
                .query(
                  "SELECT * FROM `barcode_match` WHERE `Locatie` = '" +
                    this.codeQr.toUpperCase() +
                    "' AND `Matchpoint` = '" +
                    this.currentLocation +
                    "';"
                )
                .then((e) => {
                  Object.entries(e).forEach(([key, value]) => {
                    if (key.length) console.log("[debug]");
                    if (value.length > 0) this.sendVTEForAdd = true;
                    else this.sendVTEForAdd = true;

                    this.output =
                      "Scaneaza comanda pentru [" +
                      this.valoareOfInput_loc +
                      "]";
                    document.querySelector("#output").style.color = "black";
                  });
                })
                .catch((e) => {
                  alert(e);
                });
            }
          } else if (this.codeQr.toUpperCase().startsWith("VTE-")) {
            let dataNow = new Date().toLocaleString("en-GB");
            if (this.valoareOfInput_loc.length > 0 || this.sendVTEForAdd) {
              if (this.sendVTEForAdd) {
                await db
                  .query(
                    "INSERT INTO `barcode_match` (`TimeStamp`, `Order`, `Locatie`, `Element`, `Matchpoint`) VALUES ('" +
                      dataNow +
                      "', '" +
                      this.codeQr +
                      "', '" +
                      this.valoareOfInput_loc +
                      "', '" +
                      this.valoareOfInput_loc.split(" ").pop().split("-")[0] +
                      "', '" +
                      this.currentLocation +
                      "');"
                  )
                  .then(() => {
                    this.output =
                      "" +
                      this.codeQr.toUpperCase() +
                      " salvat in " +
                      this.valoareOfInput_loc.replace("LOC ", "") +
                      "";
                    document.querySelector("#output").style.color = "green";
                  })
                  .catch((e) => {
                    alert(e);
                  });
              }
            }
          } else {
            this.startScann = false;
            this.stare = "";
          }
        }
      }
      await capLite.closeConnection("barcode_match_db");
    },

    async globalForLoop() {
      if (this.stare == "cauta") {
        this.startScann = true;
      } else if (this.stare == "locatie") {
        this.output = "Scaneaza comanda...";
        this.startScann = true;
      } else if (this.stare == "") {
        this.stare = "cauta";
        this.startScann = true;
      } else if (this.stare == "adauga_vte_in_locatie") {
        if (this.valLocatie.length > 0) {
          this.startScann = true;
        }
      } else if (this.stare == "verifica") {
        this.startScann = true;
      } else if (this.stare == "inventar") {
        this.startScann = true;
      } else if (this.stare == "complet") {
        this.startScann = false;
      }

      this.valoareSQL = [];
      // porneste / opreste camera.
    },

    buttonCauta() {

      document.querySelector("#output").style.color = "black";
      this.stare = "cauta";
      this.output = "CAUTA - Scaneaza dosarul...";
      this.valoareSQL = [];
      this.startScann = true; // activeaza camera

      this.valoareOfInput_loc = "";
      this.sendVTEForAdd = "";

    },

    buttonVerifica() {

      document.querySelector("#output").style.color = "black";
      this.output = "Scaneaza Locatia...";
      this.stare = "verifica";
      this.valoareSQL = [];
      if(this.startScann) this.startScann = false;
      this.startScann = true; // cand apasa verifica porneste si camera
      this.valLocatie = "";

      this.valoareOfInput_loc = "";
      this.sendVTEForAdd = "";

    },

    buttonInventar() {

      document.querySelector("#output").style.color = "black";
      this.output = "Scaneaza locatia...";
      this.stare = "inventar";
      this.valoareSQL = [];
      if(this.startScann) this.startScann = false;
      this.startScann = true;
      this.valLocatie = "";

      this.valoareOfInput_loc = "";
      this.sendVTEForAdd = "";

    },

    async buttonComplet() {

      this.sendVTEForAdd = "";
      this.valoareOfInput_loc = "";
      this.startScann = false;
      this.valLocatie = "";
      this.stare = "complet";
      const capLite = new SQLiteConnection(CapacitorSQLite);
      const db = await capLite.createConnection(
        "barcode_match_db",
        1,
        false,
        "no-encryption",
        false
      );
      await db.open();
      if (this.currentLocation != "" && this.currentLocation != "null") {
        let sql_query,
          loc = 2;
        if (this.currentLocation == "m") {
          this.p1 = "P";
          this.d1 = "PIEPT";

          this.p2 = "M";
          this.d2 = "MANENCI";
        } else if (this.currentLocation == "alimentat") {
          this.p1 = "F";
          this.d1 = "stofa";

          this.p2 = "D";
          this.d2 = "captuseala";

          this.p3 = "A";
          this.d3 = "accesorii";
          loc = 3;
        } else {
          this.p1 = "C"; // c
          this.d1 = "PIEPTI";

          this.p2 = "X"; // x
          this.d2 = "CAPTUSEALA";
        }

        sql_query =
          "with vbm as  (Select [Order] as [Order], REPLACE(Locatie, 'LOC ','') as Locatie, Element, row_number() over(partition by substr([Order], 1, LENGTH([Order]) - 1), Element order by [TimeStamp] desc) as RowNum  from Barcode_match)";
        sql_query +=
          "SELECT bm1.[Order], bm1.Locatie AS [locOne], bm2.Locatie AS [locTwo] ";
        if (loc == 3) sql_query += ",bm3.Locatie AS [locThree] ";
        if (loc != 3)
          sql_query +=
            " FROM vbm as bm1  INNER JOIN vbm AS bm2 ON bm1.[Order] = bm2.[Order] INNER JOIN vbm AS bm3 ON bm1.[Order] = bm3.[Order] WHERE bm2.Element = '" +
            this.p2 +
            "' and bm2.RowNum = 1 AND bm1.Element = '" +
            this.p1 +
            "' and bm1.RowNum = 1;";
        if (loc == 3)
          sql_query +=
            " FROM vbm as bm1  INNER JOIN vbm AS bm2 ON bm1.[Order] = bm2.[Order] INNER JOIN vbm AS bm3 ON bm1.[Order] = bm3.[Order] WHERE bm2.Element = '" +
            this.p2 +
            "' and bm2.RowNum = 1 AND bm1.Element = '" +
            this.p1 +
            "' and bm1.RowNum = 1 AND bm3.Element = '" +
            this.p3 +
            "' and bm3.RowNum = 1;";

        await db
          .query(sql_query)
          .then((SQL) => {
            // document.querySelector('#test_debug').innerHTML = JSON.stringify(SQL);
            Object.entries(SQL).forEach(([key, value]) => {
              if (key.length > 0) console.log("ok complete");
              if (value.length > 0) {
                this.valoareSQL = value;
              }
            });
          })
          .catch((e) => {
            alert(e);
          });

      }
      await capLite.closeConnection("barcode_match_db");
      if (this.valoareSQL.length > 0) {

        this.output = "Complete: " + this.valoareSQL.length + "";
        this.isComplete = true;

      } else {

        this.isComplete = false;
        this.output = "Nu sunt complete.";

      }

      document.querySelector("#output").style.color = "black";
    },

    async getLoc() {

      const { value } = await Preferences.get({ key: "location" });
      this.currentLocation = `${value}`;

    },

  },
  async beforeMount() {

    this.getLoc();

    try {
      // create connection to App with DB
      const capLite = new SQLiteConnection(CapacitorSQLite);
      const db = await capLite.createConnection(
        "barcode_match_db",
        1,
        false,
        "no-encryption",
        false
      );

      await db.open(); //TimeStamp TIMESTAMP NOT NULL DEFAULT current_timestamp,

      let db_statement;
      db_statement =
        "CREATE TABLE IF NOT EXISTS `barcode_match` (`TimeStamp` TIMESTAMP NOT NULL DEFAULT current_timestamp, `Order` TEXT(100), `Locatie` TEXT(100), `Element` TEXT(100), `Matchpoint` TEXT(100));";
      await db
        .execute(db_statement)
        .then(() => {
          // alert("NR1: " + JSON.stringify(res));
          this.sendRequest = true;
        })
        .catch((e) => {
          alert("qr-scanner" + e);
        });

      if (this.sendRequest) {
        let db_statement;
        db_statement =
          "CREATE TABLE IF NOT EXISTS `barcode_match_logs` (`TimeStamp` TIMESTAMP NOT NULL DEFAULT current_timestamp, `Logs` TEXT(200));";
        await db
          .execute(db_statement)
          .then(() => {
            // alert("NR2: " + JSON.stringify(res));
          })
          .catch((e) => {
            alert("qr-scanner" + e);
          });

        if (this.currentLocation == "") {
          let dataNow = new Date().toLocaleString("en-GB");
          await db
            .query(
              "INSERT INTO `barcode_match_logs` (`Logs`, `TimeStamp`) VALUES ('- [WARN]: DB successfully created..', ' " +
                dataNow +
                " ');"
            )
            .then(() => {
              console.log("ok inserted log");
            })
            .catch((e) => {
              alert(e);
            });

          await db
            .query(
              "INSERT INTO `barcode_match_logs` (`Logs`, `TimeStamp`) VALUES ('- [WARN]: DB created Tables successfull..', '" +
                dataNow +
                "');"
            )
            .then(() => {
              console.log("ok inserted log");
            })
            .catch((e) => {
              alert(e);
            });
        }
      }

      await capLite.closeConnection("barcode_match_db");
    } catch (e) {
      alert(e);
    }
  },

  unixTime(unixtime) {
    var u = new Date(unixtime);

    return (
      u.getUTCFullYear() +
      "-" +
      ("0" + u.getUTCMonth()).slice(-2) +
      "-" +
      ("0" + u.getUTCDate()).slice(-2) +
      " " +
      ("0" + u.getUTCHours()).slice(-2) +
      ":" +
      ("0" + u.getUTCMinutes()).slice(-2) +
      ":" +
      ("0" + u.getUTCSeconds()).slice(-2) +
      "." +
      (u.getUTCMilliseconds() / 1000).toFixed(3).slice(2, 5)
    );
  },

  
});
</script>

<style>
#output {
  color: rgb(0, 0, 0);
}

#qr-scann {
  height: 400px;
}

#button-desing {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
