<template>
    <content-layout title="Check if are all complete">
        <ion-content class="ion-padding">
            <table style="font-family:Arial;width:100%;border:1px solid #ccc;border-collapse: collapse;color:#667677;">
                <thead style="border:1px solid #ccc;background:#6a9ef2;color:white !important; height:50px;padding:2px;">
                    <tr style="border:1px solid #ccc;">
                        <th class="string"> Order</th>
                        <th class="string"> {{ this.d1 }}</th>
                        <th v-if="this.arrayCuKey.length > 2 && this.arrayCuKey.length <= 3" class="string"> {{ this.d2 }}</th>
                        <th v-if="this.arrayCuKey.length > 3" class="string">{{ this.d3 }}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style="border:1px solid #ccc;" v-for="barcode in valoareSQL" :key="barcode">
                        <td style="border:1px solid #ccc;text-align:center;padding:3px;" class="string">{{ barcode.Order }}</td>
                        <td style="border:1px solid #ccc;text-align:center;padding:3px;" class="string">{{ barcode.Element }}</td>
                        <td v-if="this.arrayCuKey.length > 2 && this.arrayCuKey.length <= 3" style="border:1px solid #ccc;text-align:center;padding:3px;" class="string">{{ barcode.Element }}</td>
                        <td v-if="this.arrayCuKey.length > 3" style="border:1px solid #ccc;text-align:center;padding:3px;" class="string">{{ barcode.Element }}</td>
                    </tr>
                </tbody>
            </table>

            <div id="test_debug"></div>
        </ion-content>
    </content-layout>
</template>

<script>
import { toastController } from '@ionic/vue';
import { defineComponent } from 'vue'
import { Preferences } from '@capacitor/preferences';
import { CapacitorSQLite, SQLiteConnection } from '@capacitor-community/sqlite'
import { IonContent } from '@ionic/vue';
export default defineComponent({
    data() {
        return {
            currentLocation: '',
            valoareSQL: [],
            d1: '',
            p1: '',
            d2: '',
            p2: '',
            d3: '',
            p3: '',
            arrayCuKey: []
        }
    },
    components: { IonContent },
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

            if (this.currentLocation != '' && this.currentLocation != 'null') {
                const capLite = new SQLiteConnection(CapacitorSQLite);
                const db = await capLite.createConnection("barcode_match_db", 1, false, 'no-encryption', false);

                await db.open();

                let sql_query, loc = 2;
                if (this.currentLocation == 'm') {
                    this.p1 = 'P';
                    this.d1 = 'PIEPT';

                    this.p2 = 'M';
                    this.d2 = 'MANENCI';

                } else if (this.currentLocation == 'alimentat') {
                    this.p1 = 'F';
                    this.d1 = 'stofa';

                    this.p2 = 'D';
                    this.d2 = 'captuseala';

                    this.p3 = 'A';
                    this.d3 = 'accesorii';
                    loc = 3;
                } else {
                    this.p1 = 'C'; // c 
                    this.d1 = 'PIEPTI';

                    this.p2 = 'X'; // x
                    this.d2 = 'CAPTUSEALA';
                    
                }

                sql_query = "with vbm as  (Select substr([Order], 1, LENGTH([Order]) - 1) as [Order], REPLACE(Locatie, 'LOC ','') as Locatie, Element, row_number() over(partition by substr([Order], 1, LENGTH([Order]) - 1), Element order by [TimeStamp] desc) as RowNum  from Barcode_match)";
                sql_query += "SELECT bm1.[Order], bm1.Locatie AS ["+this.d1+"], bm2.Locatie AS ["+this.d2+"] "
                if(loc == 3) sql_query += ",bm3.Locatie AS ["+this.d3+"] "
                if(loc != 3) sql_query += "FROM vbm as bm1  INNER JOIN vbm AS bm2 ON bm1.[Order] = bm2.[Order] INNER JOIN vbm AS bm3 ON bm1.[Order] = bm3.[Order] WHERE bm2.Element = '"+this.p2+"' and bm2.RowNum = 1 AND bm1.Element = '"+this.p1+"' and bm1.RowNum = 1;"
                if(loc == 3) sql_query += "FROM vbm as bm1  INNER JOIN vbm AS bm2 ON bm1.[Order] = bm2.[Order] INNER JOIN vbm AS bm3 ON bm1.[Order] = bm3.[Order] WHERE bm2.Element = '"+this.p2+"' and bm2.RowNum = 1 AND bm1.Element = '"+this.p1+"' and bm1.RowNum = 1 AND bm3.Element = '"+this.p3+"' and bm3.RowNum = 1;"


                await db.query(sql_query)
                    .then((SQL) => {
                        document.querySelector('#test_debug').innerHTML = JSON.stringify(SQL);
                        // Object.entries(SQL).forEach(([key, value]) => {
                        //     if (key.length > 0) console.log("ok complete");
                        //     if (value.length > 0) {
                        //         this.valoareSQL = value;


                        //         this.arrayCuKey.push(value);

                        //     }
                        //     else {
                        //         this.showWarninigError(10000, "Momentan nu ai nimic de imperecheat!");
                        //         document.querySelector('#test_debug').innerHTML = sql_query;
                        //     }
                        // })
                    })
                    .catch((e) => {
                        alert(e);
                    })
                await capLite.closeConnection("barcode_match_db");

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
/* th {
    background-color: var(--ion-color-success-tint);
    color: black;
} */

/*


*/
</style>

