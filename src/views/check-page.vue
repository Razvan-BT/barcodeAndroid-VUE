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
import { IonCard, IonCardHeader, IonCardContent, IonItem, IonLabel, IonInput, IonButton, toastController } from '@ionic/vue';
import { Preferences  } from '@capacitor/preferences';
import axios from 'axios';

export default {
    data() {
        return {
            valoareOfInput: '',
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
            if(this.currentLocation != '' && this.currentLocation != 'null') {
                console.log("You clicked me! val: ", this.valoareOfInput);

                let url = `https://node.formens.ro/barcode_ck3?loc=${this.valoareOfInput}&mp=` + this.currentLocation;
                axios({
                    method: 'get',
                    url: url
                })
                    .then(function (response) {
                        console.log(response);
                        document.querySelector("#send-table-result").innerHTML = response.data;
                    });
            }
            else { this.showWarninigError(3000, 'There are problem with location! Please set location first!'); }
        }
    },
    components: { IonCard, IonCardHeader, IonCardContent, IonItem, IonLabel, IonInput, IonButton }
}
</script>
    
<style scope>

</style>