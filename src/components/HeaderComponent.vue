<template>
    <ion-page>
        <ion-header>
                <ion-toolbar>
                    <ion-buttons slot="start">
                        <ion-back-button></ion-back-button>
                    </ion-buttons>
                    <ion-title>
                        {{ title }}
                    </ion-title>
                </ion-toolbar>
        </ion-header>
        <ion-content>
            <slot />
        </ion-content>
    </ion-page>
</template>

<script>
import {IonPage, IonContent, IonTitle, IonToolbar, IonHeader, IonBackButton } from '@ionic/vue';

export default {
    props: {
        title: String
    },
    component: { 
        IonPage,
        IonContent,
        IonTitle, 
        IonToolbar,
        IonHeader,
        IonBackButton
    }
}

</script>