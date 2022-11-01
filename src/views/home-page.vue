<template>
    <content-layout title="Barcode">
        <ion-card color="light">
            <ion-card-header>
                <ion-button :href="`/tools/scanning`">
                    Cauta
                </ion-button>
                <ion-button :href="`/tools/complet`">
                    Complet
                </ion-button>
                <ion-button :href="`/tools/verif`">
                    Verif
                </ion-button>
                <ion-button :href="`/tools/inventar`">
                    Inventar
                </ion-button>

                <ion-card-title>Check</ion-card-title>
                <ion-card-subtitle>Some info</ion-card-subtitle>
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
