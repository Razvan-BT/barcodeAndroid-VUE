<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script>
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { defineComponent } from 'vue';

// comment
export default defineComponent({
  name: 'App',
  components: {
    IonApp,
    IonRouterOutlet
  } 
});
</script>