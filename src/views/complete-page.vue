<template>
    <content-layout title="Check if are all complete">
        <div id="send-table-result">
        </div>
    </content-layout>
</template>

<script>
import { toastController } from '@ionic/vue';
import { defineComponent } from 'vue'
import axios from 'axios'
import { Preferences } from '@capacitor/preferences';

export default defineComponent ({
    data() {
        return {
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
        async receiveData() {

            const { value } = await Preferences.get({ key: 'location' });
            this.currentLocation = `${value}`;
            console.log('complete-page.vue - location - ', this.currentLocation); 
            if(this.currentLocation != '' && this.currentLocation != 'null') 
            {
                console.log('complete-page.vue - location - ', this.currentLocation); 

                let url = `https://node.formens.ro/barcode_match3?mp=` + this.currentLocation;
                axios({
                    method: 'get',
                    url: url
                })
                    .then(function (response) {
                        console.log(response);
                        document.querySelector("#send-table-result").innerHTML = response.data;
                        this.showWarninigError(10000, "Loaded " + `${response.data.length}.`);
                    });

            }
            else { this.showWarninigError(1000000, 'There are problem with location! Please set location first!'); }
        }
    },
    beforeMount() {
        this.receiveData();
    },
})
</script>

<style scope>
th {
    background-color: var(--ion-color-success-tint);
    color: black;
}
</style>