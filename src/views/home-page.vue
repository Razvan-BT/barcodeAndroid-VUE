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
                <ion-button :href="`/inventar`">
                    Inventar
                </ion-button>
            </ion-card-header>
                <ion-card-content>
                    <ion-card-subtitle v-if="lastVte_scanned != '' && lastVte_scanned != 'null'">Ultimul dosar scanat: {{ this.lastVte_scanned.toUpperCase() }}</ion-card-subtitle>
                </ion-card-content>
        </ion-card>


    </content-layout>

</template>

<script>
import { IonCard, IonCardHeader, IonCardContent, IonCardSubtitle, IonButton } from '@ionic/vue';
import { defineComponent } from 'vue';
import { Preferences } from '@capacitor/preferences';

export default defineComponent({
    data() {
        return {
            lastVte_scanned: '' 
        }
    },
    components: { IonCard, IonCardHeader, IonCardSubtitle, IonButton, IonCardContent },
    methods: {
        async getLastVteScanned() {
            const { value } = await Preferences.get({ key: 'lastVte_scanned' });
            this.lastVte_scanned = `${value}`;
        }
    },
    beforeMount() {
        // Cand intri prima data pe pagina 'isi da refresh'
        this.getLastVteScanned();
    }
});
</script>
