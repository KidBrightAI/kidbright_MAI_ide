<template>
  <b-modal
      modal-class="my-modal-class"
      id="wifi_conn"
      title="WIFI SETTING"
      @ok="connectToWifi"
      @show="openWifi"
      @hidden="clearData"
      :ok-disabled="loading"
    >
      <div  v-if="loading" style="text-align: center;">
        <b-spinner variant="success" style="width: 4rem; height: 4rem;" label="Spinning"></b-spinner>
      </div>
      <div v-else>
        <p class="modal-ttl">Please select wifi from list</p>
        <p class="modal-desc">
          เลือกเครือข่าย wi-fi เพื่อเชื่อต่ออินเทอร์เน็ต สำหรับ KidBright AI<br />หมายเหตุ
          : แนะนำให้เลือกเครือข่ายเดียวกันกับคอมพิวเตอร์
        </p>
        <b-dropdown
          id="ddCommodity"
          name="ddCommodity"
          :text="selected_ssid ? selected_ssid : 'Select Wi-Fi'"
          v-model="selected_ssid"
          variant="secondary"
          class="mb-2"
          menu-class="w-100"
          block
        >
          <b-dropdown-item
            v-for="(ssid,i) in wifiList"
            :key="i"
            @click="selected_ssid = ssid"
          >
            {{ ssid }}
          </b-dropdown-item>
        </b-dropdown>

        <b-form-input
          v-model="wifi_password"
          placeholder="กรุณาใส่รหัสผ่าน"
        ></b-form-input>
      </div>
      <template #modal-footer="{ ok, cancel }">
        <b-button @click="cancel()" :disabled="saving">
          Cancel
        </b-button>
        <b-button variant="primary" @click="ok()" :disabled="saving || loading">
        <b-spinner small v-if="saving" class="mr-1"></b-spinner>
          Connect
        </b-button>
      </template>
    </b-modal>
</template>
<script>
import axios from "axios";
import { mapState, mapActions, mapMutations  } from 'vuex';
export default {
  components: {
  },
  name : "ConnectWifiModal",
    data(){
    return {
      loading: true,
      saving: false,
      wifiList: [],
      selected_ssid : "",
      wifi_password : "",
    };
  },
  computed: {
    ...mapState(['serverUrl','terminalUrl'])
  },
  methods: {
    async listWifi(){
      this.loading = true;
      try{
        const res = await axios.get(this.terminalUrl + "/listWifi");
        if(res.data.status && res.data.status == "OK"){
          this.wifiList = res.data.ap;
          console.log(this.wifiList);
        }
        this.loading = false;
      }catch(err){
        this.loading = false;
      }
    },
    async openWifi(){
      this.loading = true;
      this.saving = false;
      this.wifiList = [];
      this.selected_ssid = "";
      this.wifi_password = "";
      await this.listWifi();
    },
    clearData(){
      this.wifiList = [];
      this.selected_ssid = "";
      this.wifi_password = "";
      this.saving = false;
    },
    async connectToWifi(ev){
      ev.preventDefault();
      this.saving = true;
      try {
        const res = await axios.post(this.terminalUrl + "/wifiConnect", { ssid: this.selected_ssid, password: this.wifi_password });
        if (res.data.status && res.data.status == "OK") {
          this.$toast.success("เชื่อมต่อ WiFi สำเร็จ");
        }
      } catch (err) {
        this.$toast.error("เชื่อมต่อ WiFi ล้มเหลว :" + err.message);
      } finally {
        this.saving = false;
        this.loading = false;
        this.$bvModal.hide("wifi_conn");
      }
    }
  },
}
</script>
