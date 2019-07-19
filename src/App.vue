<template>
  <div id="app">

    <GraphPage :parsedRideData='fetchedData'/>

    <div id='about' class='about-box' v-if='showAbout'>
      <h2>About Project</h2>
      <div style='text-align: left'>
          <p>
          This project aims to visualize lyft/uber rides by crawling email receipts.<br>

          You can see a sample of what the data looks like from my account. If you would like to visualize your own data, click on the top right button to authenticate with Google and the app will fetch your data.<br>
          </p>

          <p>
            This app is made possible thanks to the following packages:
            <ul>
                <li><a target="_blank" href="https://github.com/vuejs/awesome-vue">Vue.js</a></li>
                <li><a target="_blank" href="https://plot.ly/javascript">Plotly.js</a></li>
                <li><a target="_blank" href="https://david-desmaisons.github.io/vue-plotly/">Vue-Plotly</a></li>
            </ul>

            For more technical details, check out this <a target="_blank" href="https://zouhairm.github.io/lyftuber">Blog Post</a>
          </p>

          <p class='privacy-note'>
          Note on Privacy and Data: The application relies on Google's OAuth2 workflow to access the emails, and therefore your login/password information is never shared with it either. Moreover, this application is <em>entirely</em> client side. This means that your data is not sent to a 3rd party server nor is it saved anywhere. If there is interest, it might in the future collect anonymized statistics (averaged values over time) from each user.
          </p>
      </div>
      <a href='#' @click.prevent='showAbout = false'  class='close-about' title='Close this message'>Close</a>
  </div>

  <div class='footer'>
      <a @click.prevent='showAbout = !showAbout' class='about-link'>About</a>
      <p class='copyText'>
          Made during late night hours by <a target="_blank" href="https://zouhairm.github.io/bio">Zouhair M</a>
      </p>
  </div>

  <div class='header'>
      <a @click.prevent='doLoginOrOut' class='login-link' >{{loginText}}</a>
      <span class="tooltiptext">{{loginHoverText}}</span>

      <a @click.prevent='doFetch' v-if='signedIn' class='fetch-link' >Fetch</a>
  </div>

  </div>
</template>

<script>
/*eslint no-console: ["error", { allow: ["warn", "error"] }] */

import GraphPage from './components/GraphPage.vue'
import {fetchMetaData} from './lib/gmail.js'
export default {
  name: 'app',

  data() {
    return {
      showAbout: false,
      fetchedData: {allRides: []},
      GoogleUser: null,
      signedIn: this.$isAuthenticated(),
      gapiClient: null,
    };
  },

  created(){
    if (this.signedIn)
    {
      this.$getGapiClient().then(gapi => {
        this.gapiClient = gapi;
        fetchMetaData(gapi, this.fetchedData);
      });
    }
  },

  components: {
    GraphPage
  },

  computed: {
    loginText(){
      return this.signedIn ? "Logout" : "Login"
    },
    loginHoverText(){
      if(this.signedIn)
      {
        return "Click To Logout"
      }
      else
      {
        return "Click to Login using Google"
      }
    }
  },

  methods: {
    doFetch(){
      if(this.gapiClient){
        fetchMetaData(this.gapiClient, this.fetchedData);
      }
    },
    doLoginOrOut(){
      if(this.signedIn) {
        this.$logout();
        this.signedIn = false;
        this.fetchedData = {allRides: []};
        this.gapiClient = null;
      }
      else {
        this.$login()
        .then(() => {
          // On success nothing to do ... 
          this.signedIn = this.$isAuthenticated()
          this.$getGapiClient().then(gapi => {
            this.gapiClient = gapi;
            fetchMetaData(gapi, this.fetchedData);
          });
        })
        .catch(error  => {
          console.error('Failed to login! ', error)
        })
      }


    },

  }
}

</script>

<style>
body{
  background-color: black;
}
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 50px;
  background-color: #505050;
}

a {
  color: rgb(53, 162, 162);
  text-decoration: none;
  text-align: center;
  padding: 0 4px
}


.about-box {
  position: absolute;
  left: 30%;
  padding: 14px;
  top: 64px;
  width: 40%;
  background: rgba(255, 255, 255, 0.9) url("./assets/logo.png") no-repeat center;
  background-blend-mode: lighten;
  background-position-y: top;
  border-radius: 5%;
  box-shadow: 0 2px 4px rgba(0,0,0,.2), 0 -1px 0 rgba(0,0,0,.02);
  z-index: 1;

}
.privacy-note {
  font-size: smaller;
}

.close-about {
  float: right;
  margin-right: 14px;
  font-size: 12px;
  font-weight: bold;
  color: blue;
}

.footer {
  position: absolute;
  width: 100%;
  left: 10px;
  bottom : 9px;
  display: flex;
  z-index: 1;
}
.about-link {
  background: rgba(177, 197, 163, 0.50);
  padding: 5px 10px;
  margin-right: 5px;
  border-radius: 5%;
  cursor: pointer;
  z-index: 1;
}

.header {
  position: absolute;
  width: 100%;
  left: 10px;
  top : 10px;
  display: flex;
  z-index: 1;
}

.fetch-link,
.login-link {
  background: rgba(177, 197, 163, 0.50);
  padding: 5px 10px;
  margin-right: 5px;
  border-radius: 5%;
  cursor: pointer;
  z-index: 1;
}

.fetch-link{
  left: 40px;
}

/* Tooltip text */
.header .tooltiptext {
  visibility: hidden;
  width: 120px;
  background-color: gray;
  opacity: 0.2;
  color: #fff;
  text-align: center;
  padding: 5px 0;
  border-radius: 6px;
  cursor: pointer;
 
  /* Position the tooltip text - see examples below! */
  position: absolute;
  top: 102%;
  left: 2%; 
  z-index: 1;
}

/* Show the tooltip text when you mouse over the tooltip container */
.header:hover .tooltiptext {
  visibility: visible;
}


.copyText {
  font-size: 9px;
  color: #999;
}

</style>
