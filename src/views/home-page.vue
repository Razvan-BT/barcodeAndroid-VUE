<template>
    <content-layout title="Barcode">
        <ion-card color="light">
            <ion-card-header>
                <ion-button :href="`/tools/check/scanning`">
                    <!-- loc3?order=vte&mp=alimentat -->
                    Cauta
                </ion-button>
                <ion-button :href="`/complet`">
                    <!-- barcode_match3?mp=alimentat -->
                    Complet
                </ion-button>
                <ion-button :href="`/check`">
                    <!-- barcode_ck3?loc=LOC C-3&mp=alimentat -->
                    Verif
                </ion-button>
                <!-- <ion-button :href="`/inventar`">
                    Inventar
                </ion-button> -->
            </ion-card-header>
            <ion-card-content>
                <ion-card-subtitle v-if="lastVte_scanned != '' && lastVte_scanned != 'null'">Ultimul dosar scanat: {{
                        this.lastVte_scanned.toUpperCase()
                }}</ion-card-subtitle>
            </ion-card-content>
        </ion-card>


    </content-layout>

</template>

<script>
import { IonCard, IonCardHeader, IonCardContent, IonCardSubtitle, IonButton } from '@ionic/vue';
import { defineComponent } from 'vue';
import { Preferences } from '@capacitor/preferences';
import { CapacitorSQLite, SQLiteConnection } from '@capacitor-community/sqlite'

export default defineComponent({
    data() {
        return {
            lastVte_scanned: '',
            sendRequest: false
        }
    },
    components: { IonCard, IonCardHeader, IonCardSubtitle, IonButton, IonCardContent },
    methods: {
        async getLastVteScanned() {
            const { value } = await Preferences.get({ key: 'lastVte_scanned' });
            this.lastVte_scanned = `${value}`;
        }
    },
    async beforeMount() {
        // Cand intri prima data pe pagina 'isi da refresh'
        this.getLastVteScanned();

        try { // create connection to App with DB
            const capLite = new SQLiteConnection(CapacitorSQLite);
            const db = await capLite.createConnection("barcode_match_db", 1, false, 'no-encryption', false);

            await db.open(); //TimeStamp TIMESTAMP NOT NULL DEFAULT current_timestamp,

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

                if (this.lastVte_scanned == '') {
                    await db.query("INSERT INTO `barcode_match_logs` (`Logs`) VALUES ('- [WARN]: DB successfully created..');")
                        .then(() => { console.log("ok inserted log"); })
                        .catch(e => {
                            alert(e);
                        });

                    await db.query("INSERT INTO `barcode_match_logs` (`Logs`) VALUES ('- [WARN]: DB created Tables successfull..');")
                        .then(() => { console.log("ok inserted log"); })
                        .catch(e => {
                            alert(e);
                        });
                }
            }

            await capLite.closeConnection('barcode_match_db');
        }
        catch (e) {
            alert(e);
        }

    }
});
</script>
