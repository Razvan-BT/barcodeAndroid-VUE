<template>
    <content-layout title="Check if are all complete">
        <div id="send-table-result">
        </div>
    </content-layout>
</template>

<script>
import { defineComponent } from 'vue'
import axios from 'axios'

export default defineComponent ({
    methods: {
        receiveData() {
            let url = `https://node.formens.ro/barcode_match3?mp=alimentat`
            axios({
                method: 'get',
                url: url
            })
                .then(function (response) {
                    console.log(response);
                    document.querySelector("#send-table-result").innerHTML = response.data;
                });
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