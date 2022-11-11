<template>
    <ion-menu content-id="main-content">
        <ion-header>
            <ion-toolbar>
                <ion-title>Menu Content</ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
            <ion-list>
                <ion-item :href="`/`">
                    <!-- Transfer to page with settings -->
                    <ion-label>
                        Home page
                    </ion-label>
                </ion-item>
                
                <ion-item :href="`/settings`">
                    <!-- Transfer to page with settings -->
                    <ion-label>
                        Settings
                    </ion-label>
                </ion-item>
            </ion-list>
        </ion-content>
    </ion-menu>
    <ion-page id="main-content">
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-menu-button></ion-menu-button>
                </ion-buttons>
                <ion-title>{{ title }}</ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
            <slot />
        </ion-content>
    </ion-page>
    <!-- <ion-page>
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
    </ion-page> -->
</template>

<script>
// import { home, settings } from 'ionicons/icons'

import {
    IonPage,
    IonContent,
    IonTitle,
    IonToolbar,
    IonHeader,
    IonBackButton,
    IonMenu,
    IonMenuButton,
    IonItem,
    IonLabel,
    IonList
} from '@ionic/vue';

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
        IonBackButton,
        IonMenu,
        IonMenuButton,
        IonItem,
        IonList,
        IonLabel,
    },
}
</script>
