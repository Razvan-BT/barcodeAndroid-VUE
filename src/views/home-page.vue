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

                <ion-card-title>Scaneaza dosarul...</ion-card-title>
                <ion-card-subtitle>Dosar scanat: VTE-572901</ion-card-subtitle>
            </ion-card-header>

            <ion-card-content>

            </ion-card-content>
        </ion-card>


    </content-layout>

</template>

<script>
import { IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonButton } from '@ionic/vue';
import { defineComponent } from 'vue';

export default defineComponent({
    components: { IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonButton },
});
</script>
