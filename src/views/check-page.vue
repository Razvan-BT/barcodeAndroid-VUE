<template>
    <content-layout title="Verifica locatia">
        <ion-card color="light">
            <ion-card-header>
                <ion-item>
                    <ion-label position="floating">Cauta locatia</ion-label>
                    <ion-input @ionChange="valoareOfInput = $event.target.value"></ion-input>
                </ion-item>
                <ion-button @click="checkAfterLocation">Cauta</ion-button>
            </ion-card-header>
            <ion-card-content>
                <div id="send-table-result"></div>
            </ion-card-content>
        </ion-card>
    </content-layout>
</template>
    
<script>
// SQLiteDBConnection
import { CapacitorSQLite, SQLiteConnection } from '@capacitor-community/sqlite'
import { IonCard, IonCardHeader, IonCardContent, IonItem, IonLabel, IonInput, IonButton, toastController } from '@ionic/vue';
import { Preferences } from '@capacitor/preferences';

export default {
    data() {
        return {
            insertVTEInLocation: false,
            valoareOfInput: '',
            locatieVte: '',
            currentLocation: ''
        }
    },
    methods: {
        async showWarninigError(time, message) {
            const toast = await toastController.create({
                message: message,
                duration: time,
                position: 'middle'
            });

            await toast.present();
        },
        async checkAfterLocation() {
            const { value } = await Preferences.get({ key: 'location' });
            this.currentLocation = `${value}`;
            if (this.currentLocation != '' && this.currentLocation != 'null') {
                const capLite = new SQLiteConnection(CapacitorSQLite);
                const db = await capLite.createConnection("barcode_match_db", 1, false, 'no-encryption', false);
                await db.open();
                if (this.insertVTEInLocation) {
                    if (this.valoareOfInput.startsWith('VTE-')) {
                        await db.query(`INSERT INTO barcode_match (Order, Locatie, Matchpoint, Element) VALUES (${this.valoareOfInput}, ${this.locatieVte}, ${this.currentLocation}, ${this.currentLocation.split(' ').pop().split('-')[0]})`)
                            .then(() => {

                                this.insertLogs(`[${this.valoareOfInput}]: Located ${this.locatieVte} with MP ${this.currentLocation} and E: ${this.currentLocation.split(' ').pop().split('-')[0]} - was inserted in [db: barcode_match_db]`);
                                this.insertVTEInLocation = false;
                            })
                            .catch(error => {
                                alert('error' + error)
                            });
                    }
                    else {
                        this.showWarninigError(5000, "VTE invalid. Aceasta trebuie sa contina 'VTE-'");
                    }
                } else {
                    await db.query('SELECT * FROM `barcode_match` WHERE `Locatie` = "'+ this.valoareOfInput +'" AND `Matchpoint` = "'+ this.currentLocation +'"')
                        .then(valueDD => {
                            Object.entries(valueDD).forEach(([key, value]) => {
                                if (key.length > 0) console.log('Nothing');
                                if (value.length > 0) {
                                    // filters = getFiltersFromData(value)
                                    // sendToString = filters.Address

                                    // Daca exista voi crea un table cu Order - adica VTE-urile care sunt in acea locatie.
                                    // Daca nu Sa insertezi un VTE in locatia respective. Ex: C-1 
                                    if (!this.valoareOfInput.startsWith('VTE-')) this.locatieVte = this.valoareOfInput;
                                    else this.showWarninigError(5000, "Location invalid!");
                                }
                                else this.insertVTEInLocation = true;
                            });
                            // document.querySelector("#send-table-result").innerHTML = sendToString.toString();
                        })
                        .catch(error => {
                            alert('error' + error)
                        });

                }
                await capLite.closeConnection('barcode_match_db');
            }
            else { this.showWarninigError(3000, 'There are problem with location! Please set location first!'); }
        },
        async insertLogs(logs) {
            const capLite = new SQLiteConnection(CapacitorSQLite);
            const db = await capLite.createConnection("barcode_match_db", 1, false, 'no-encryption', false);

            await db.open();

            let db_statement = 'INSERT INTO `barcode_match_logs` (`Logs`) VALUES (`' + logs + '`)';
            await db.query(db_statement)
                .then(() => { console.log("ok inserted log"); })
                .catch(error => {
                    alert('error' + error)
                });
            await capLite.closeConnection('barcode_match_db');
        }
    },
    components: { IonCard, IonCardHeader, IonCardContent, IonItem, IonLabel, IonInput, IonButton }
}
</script>
    
<style scope>

</style>