<template>
    <content-layout title="Scaneaza locatia">
        <div id="alert-error" style="display: none;">{{ this.alertMessage }}</div>
        <ion-card color="light">

            <ion-card-header>
                    <qrcode-stream @decode="decode" @init="logErrors"></qrcode-stream>
            </ion-card-header>
        </ion-card>
    </content-layout>
</template>
    
<script>
// SQLiteDBConnection
import { CapacitorSQLite, SQLiteConnection } from '@capacitor-community/sqlite'
import { IonCard, IonCardHeader, toastController } from '@ionic/vue';
import { Preferences } from '@capacitor/preferences';
import { QrcodeStream } from "vue3-qrcode-reader";
export default {
    data() {
        return {
            currentLocation: '',
            valoareInput: '',
            alertMessage: '',
            valoareOfInput: '',
            valoareOfInput_loc: '',
            sendVTEForAdd: false,
            locatieVte: ''
        }
    },
    methods: {
        async decode(codeQr) {
            this.valoareInput = codeQr;
            const capLite = new SQLiteConnection(CapacitorSQLite);
            if (this.currentLocation != '' && this.currentLocation != 'null') {
                const db = await capLite.createConnection("barcode_match_db", 1, false, 'no-encryption', false);
                await db.open();
                this.valoareOfInput = this.valoareInput.toUpperCase();
                if (this.valoareOfInput.startsWith('LOC ')) {
                    if (this.sendVTEForAdd == false) {
                        this.valoareOfInput_loc = this.valoareOfInput.toUpperCase();
                        await db.query("SELECT * FROM `barcode_match` WHERE `Locatie` = '" + this.inputCuLoc + "' AND `Matchpoint` = '" + this.currentLocation + "';")
                            .then((e) => {
                                Object.entries(e).forEach(([key, value]) => {
                                    if (key.length) console.log("[debug]");
                                    if (value.length > 0) {
                                        this.sendVTEForAdd = true;
                                    } else {
                                        this.sendVTEForAdd = true;

                                        this.alertMessage = "Scaneaza un VTE pentru locatia [" + this.valoareOfInput_loc + "]";
                                        document.querySelector('#alert-error').style.display = "block";
                                    }
                                });
                            })
                            .catch((e) => {
                                alert(e);
                            });
                    }
                    else {
                        document.querySelector('#alert-error').style.display = "block";
                        this.alertMessage = "ERROR: Incearca din nou...";

                        let db_statement = "INSERT INTO `barcode_match_logs` (`Logs`) VALUES ('- [ERROR]: Something went wrong (sendVTEForAdd) - inventar page');";
                        await db.query(db_statement)
                            .then(() => {
                                console.log("ok inserted log");
                                document.querySelector('#alert-error').style.display = "none";
                            })
                            .catch(e => {
                                alert(e);
                            });
                    }


                }
                else if (this.valoareOfInput.startsWith('VTE-')) {

                    if (this.valoareOfInput_loc.length > 0 || this.sendVTEForAdd) {
                        if (this.sendVTEForAdd) {
                            await db.query("INSERT INTO `barcode_match` (`Order`, `Locatie`, `Element`, `Matchpoint`) VALUES ('" + this.valoareOfInput + "', '" + this.valoareOfInput_loc + "', '" + this.valoareOfInput_loc.split(' ').pop().split('-')[0] + "', '" + this.currentLocation + "');")
                                .then(() => {
                                    document.querySelector('#alert-error').style.display = "block";
                                    document.querySelector('#alert-error').style.backgroundColor = "rgb(47, 141, 44)";
                                    this.alertMessage = "" + this.valoareOfInput + " a fost adaugat cu success in locatia " + this.valoareOfInput_loc.replace('LOC ', '') + "Scaneaza alta locatie..";

                                    // this.sendVTEForAdd = false;
                                    // this.valoareOfInput = '';
                                    // this.valoareOfInput_loc = '';
                                })
                                .catch((e) => {
                                    alert(e);
                                });
                        } else {
                            this.showWarninigError(3000, 'WARNING: VTE-ul nu poate fi adaugat in locatia curenta. Posibile errori: valoare locatie invalida sau VTE nevalid', 'bottom');
                        }
                    }
                    else {
                        this.showWarninigError(3000, 'WARNING: VTE-ul nu poate fi adaugat in locatia curenta. Posibile errori: valoare locatie invalida sau VTE nevalid', 'bottom');
                        document.querySelector('#alert-error').style.display = "block";
                        this.alertMessage = "ERROR: Reporneste aplicatia pentru a reveni...";

                        let db_statement = "INSERT INTO `barcode_match_logs` (`Logs`) VALUES ('- [ERROR]: Something went wrong (sendVTEForAdd || valOfInput_loc invalid) - inventar page');";
                        await db.query(db_statement)
                            .then(() => { console.log("ok inserted log"); })
                            .catch(e => {
                                alert(e);
                            });


                    }
                }
                else this.showWarninigError(3000, 'WARNING: VTE-ul invalid (nu contine VTE-).', 'bottom');
            }
            else {
                this.showWarninigError(3000, 'WARNING: Seteaza locatia pentru a continua.', 'middle');
            }
            await capLite.closeConnection('barcode_match_db');
        },
        async showWarninigError(time, message, position) {
            const toast = await toastController.create({
                message: message,
                duration: time,
                position: position
            });

            await toast.present();
        },
        async getLoc() {
            const { value } = await Preferences.get({ key: 'location' });
            this.currentLocation = `${value}`;
        }
    },
    beforeMount() {
        this.getLoc();
    },
    components: { QrcodeStream, IonCard, IonCardHeader}
}
</script>
    
<style scope>
/* #send-table-result {
    font-size: 20px;
    color: green;
    font-weight: 500;
} */

#alert-error {
    width: 100%;
    background-color: rgb(206, 65, 65);
    color: white;
    font-size: 13px;
    font-weight: bold;
    padding: 10px;
    margin-top: 10px;
    border-radius: 5px;
    box-shadow: 2px 1px 1px 5px solid grey;
}
</style>