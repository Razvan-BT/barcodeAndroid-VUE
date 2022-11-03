<template>
    <content-layout title="Settings">
        <ion-content class="ion-padding">
            <ion-list>
                <h3>Location
                    <ion-label v-if="inform != '' || inform == 'none'">- {{ inform }}</ion-label>
                    <ion-label v-else>- no set</ion-label>
                </h3>
                <ion-item>
                    <ion-select interface="popover" :value="inform" @ionChange="openLocations = $event.target.value" placeholder="Choose">
                        <ion-select-option v-for="loc in locations" :key="loc" :value="loc.type">{{ loc.name }}
                        </ion-select-option>
                    </ion-select>
                </ion-item>
                <ion-button @click="setLocation">Set location</ion-button>
            </ion-list>
        </ion-content>
    </content-layout>
</template>


<script>

import { IonItem, IonList, IonLabel, IonSelect, IonSelectOption, toastController } from '@ionic/vue';
import { Preferences } from '@capacitor/preferences';
import { defineComponent } from 'vue'
export default defineComponent({
    data() {
        return {
            inform: "",
            openLocations: "",
            locations: [
                { id: 0, type: 'alimentat', name: 'Alimentat' },
                { id: 1, type: 'ch', name: 'Ch' },
                { id: 2, type: 'm', name: 'M' },
                { id: 3, type: 'none', name: 'Nothing' }
            ]
        }
    },

    components: { IonItem, IonList, IonLabel, IonSelect, IonSelectOption },

    methods: {
        async showLabel(message) {
            const toast = await toastController.create({
                message: message,
                duration: 5000,
                position: 'bottom'
            });

            await toast.present();
        },
        async setTigger() {
            await Preferences.set({
                key: 'location',
                value: 'Alimentat'
            })
            console.log("Alimentat");

        },
        async getLoc() {
            const { value } = await Preferences.get({ key: 'location' });
            this.inform = `${value}`;
            console.log(this.inform);
        },
        setLocation() {
            Preferences.set({
                key: 'location',
                value: this.openLocations
            })
            console.log("LOCATION SET: ", this.openLocations);


            this.showLabel('Location set to: ' + this.openLocations.toUpperCase());
        }

    },
    beforeMount() {
        this.getLoc();
    }
});
</script>
