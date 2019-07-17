import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false

const apiKey = process.env.VUE_APP_GAPI_API_KEY;
const clientId = process.env.VUE_APP_GAPI_CLIENT_ID;

if (!apiKey || !clientId) {
  throw new Error(
    "Has the .env.local file been setup? One or both variables are not set: VUE_APP_GAPI_API_KEY=" +
      apiKey +
      ", VUE_APP_GAPI_CLIENT_ID=" +
      clientId
  );
}

import VueGAPI from 'vue-gapi'

const gAPIConfig = {
  apiKey,
  clientId,
  scope: 'email profile https://www.googleapis.com/auth/gmail.readonly', 
  discoveryDocs: [ "https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest" ]
}

Vue.use(VueGAPI, gAPIConfig)


window.Vue = new Vue({
  render: h => h(App),
}).$mount('#app')
