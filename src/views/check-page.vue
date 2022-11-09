<template>
    <content-layout title="Verifica locatia">
        <ion-card color="light">

            <ion-card-header>
                <ion-item>
                    <ion-label position="floating">Cauta locatia {{ this.valoareInput }}</ion-label>
                    <ion-input @ionChange="valoareInput = $event.target.value"></ion-input>
                </ion-item>
                <ion-button @click="checkAfterLocation">Cauta</ion-button>
            </ion-card-header>

            <ion-card-content>
                <div id="send-table-result"></div>
                <div id="show-table" style="display:none">

                    <table
                        style="font-family:Arial;width:100%;border:1px solid #ccc;border-collapse: collapse;color:#667677;">
                        <thead
                            style="border:1px solid #ccc;background:#6a9ef2;color:white !important; height:50px;padding:2px;">
                            <tr style="border:1px solid #ccc;">
                                <th class="string">Order</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style="border:1px solid #ccc;" v-for="barcode in sendData" :key="barcode">
                                <td style="border:1px solid #ccc;text-align:center;padding:3px;" class="string">{{
                                        barcode.Order
                                }}</td>
                            </tr>
                        </tbody>
                    </table>

                </div>
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
            valoareInput: '',
            valoareOfInput: '',
            valoareOfInput_loc: '',
            sendVTEForAdd: false,
            locatieVte: '',
            sendData: [],
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
                this.valoareOfInput = this.valoareInput.toUpperCase();
                if (this.valoareOfInput.startsWith('LOC ') && this.sendVTEForAdd == false) {
                    this.valoareOfInput_loc = this.valoareOfInput;
                    await db.query("SELECT * FROM `barcode_match` WHERE `Locatie` = '" + this.valoareOfInput_loc + "';")
                        .then((e) => {
                            Object.entries(e).forEach(([key, value]) => {
                                if (key.length) console.log("[debug]");
                                if (value.length > 0) {
                                    document.querySelector('#show-table').style.display = "block";
                                    this.sendData = value;

                                    this.sendVTEForAdd = true;
                                } else {
                                    this.sendVTEForAdd = true;
                                    this.showWarninigError(3000, 'Nu exista nici un VTE in acea locatie.');
                                }
                            });
                        })
                        .catch((e) => {
                            alert(e);
                        });


                }
                else if (this.valoareOfInput.includes('VTE-') && this.valoareOfInput_loc.length > 0 || this.sendVTEForAdd) {

                    if (this.sendVTEForAdd) {
                        await db.query("INSERT INTO `barcode_match` (`Order`, `Locatie`, `Element`) VALUES ('" + this.valoareOfInput + "', '"+ this.valoareOfInput_loc +"', '"+ this.valoareOfInput_loc.split(' ').pop().split('-')[0] +"');")
                            .then(() => {

                                document.querySelector('#send-table-result').innerHTML = "" + this.valoareOfInput + " adaugat in locatia " + this.valoareOfInput_loc + "";
                                this.valoareOfInput_loc = '';

                                this.insertLogs("- [" + this.valoareOfInput + "] inserted in location " + this.valoareOfInput_loc + "");
                                this.sendVTEForAdd = false;
                                this.valoareOfInput = '';
                            })
                            .catch((e) => {
                                alert(e);
                            });
                    }
                    else {
                        this.showWarninigError(3000, 'WARNING: VTE-ul nu poate fi adaugat in locatia curenta.');
                    }
                }
                await capLite.closeConnection('barcode_match_db');
            }
            else {
                this.showWarninigError(3000, 'WARNING: Seteaza locatia pentru a continua.');
            }
        },
        async insertLogs(logs) {
            const capLite = new SQLiteConnection(CapacitorSQLite);
            const db = await capLite.createConnection("barcode_match_db", 1, false, 'no-encryption', false);

            await db.open();

            let db_statement = 'INSERT INTO `barcode_match_logs` (`Logs`) VALUES (' + logs + ');';
            await db.query(db_statement)
                .then(() => { console.log("ok inserted log"); })
                .catch(e => {
                    this.insertLogs(" [ERROR: ] '" + e + "'");
                });
            await capLite.closeConnection('barcode_match_db');
        }
    },
    components: { IonCard, IonCardHeader, IonCardContent, IonItem, IonLabel, IonInput, IonButton }
}
</script>
    
<style scope>
#send-table-result {
    font-size: 20px;
    color: green;
    font-weight: 500;
}
</style>