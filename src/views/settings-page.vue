<template>
  <content-layout title="Settings">
    <ion-content class="ion-padding">
      <ion-list>
        <h3>
          Location
          <ion-label v-if="this.inform != '' || this.inform == 'none'"
            >- {{ this.inform }}</ion-label
          >
          <ion-label v-else>- no set</ion-label>
        </h3>
        <ion-item>
          <ion-select
            interface="popover"
            :value="this.inform"
            @ionChange="openLocations = $event.target.value"
            placeholder="Choose"
          >
            <ion-select-option
              v-for="loc in locations"
              :key="loc"
              :value="loc.type"
              >{{ loc.name }}
            </ion-select-option>
          </ion-select>
        </ion-item>
        <ion-button @click="setLocation">Set location</ion-button>
      </ion-list>
      <h3>Logs</h3>
      <ion-list>
        <ion-item v-for="log in showUserLogs" :key="log">
          [{{ log.TimeStamp }}] {{ log.Logs }}
        </ion-item>
      </ion-list>
    </ion-content>
  </content-layout>
</template>

<script>
import {
  IonItem,
  IonList,
  IonLabel,
  IonSelect,
  IonSelectOption,
  toastController,
} from "@ionic/vue";
import { Preferences } from "@capacitor/preferences";
import { defineComponent } from "vue";
import { CapacitorSQLite, SQLiteConnection } from "@capacitor-community/sqlite";
export default defineComponent({
  data() {
    return {
      inform: "",
      showUserLogs: [],
      openLocations: "",
      locations: [
        { id: 0, type: "alimentat", name: "Alimentat" },
        { id: 1, type: "ch", name: "Ch" },
        { id: 2, type: "m", name: "M" },
        { id: 3, type: "null", name: "Nothing" },
      ],
    };
  },

  components: { IonItem, IonList, IonLabel, IonSelect, IonSelectOption },

  methods: {
    async showLabel(message) {
      const toast = await toastController.create({
        message: message,
        duration: 5000,
        position: "bottom",
      });

      await toast.present();
    },
    async getLoc() {
      const { value } = await Preferences.get({ key: "location" });
      this.inform = `${value}`;
      console.log(this.inform);
    },
    async setLocation() {
      let dataNow = new Date().toLocaleString("en-GB");
      const capLite = new SQLiteConnection(CapacitorSQLite);
      const db = await capLite.createConnection(
        "barcode_match_db",
        1,
        false,
        "no-encryption",
        false
      );

      await db.open();
      await db
        .query(
          "INSERT INTO `barcode_match_logs` (`TimeStamp`, `Logs`) VALUES ('" +
            dataNow +
            "', '- [WARN]: Location set from " +
            this.inform +
            " to " +
            this.openLocations +
            "');"
        )
        .then((valoare) => {
          Object.entries(valoare).forEach(([key, value]) => {
            if (key.length > 0) console.log("[debug] key works at qr-scanner");
            if (value.length > 0) {
              this.showUserLogs = value;
            }
          });
        })
        .catch((error) => {
          alert(error);
        });
      await capLite.closeConnection("barcode_match_db");

      Preferences.set({
        key: "location",
        value: this.openLocations,
      });
      console.log("LOCATION SET: ", this.openLocations);

      this.showLabel("Location set to: " + this.openLocations.toUpperCase());
    },
    async getLogs() {
      const capLite = new SQLiteConnection(CapacitorSQLite);
      const db = await capLite.createConnection(
        "barcode_match_db",
        1,
        false,
        "no-encryption",
        false
      );

      await db.open();

      await db
        .query(
          "SELECT * FROM `barcode_match_logs` ORDER BY TimeStamp DESC LIMIT 10"
        )
        .then((valoare) => {
          Object.entries(valoare).forEach(([key, value]) => {
            if (key.length > 0) console.log("[debug] key works at qr-scanner");
            if (value.length > 0) {
              this.showUserLogs = value;
            }
          });
        })
        .catch((error) => {
          alert(error);
        });
      await capLite.closeConnection("barcode_match_db");
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
  },
  beforeMount() {
    this.getLoc();
    this.getLogs();
  },
});
</script>
