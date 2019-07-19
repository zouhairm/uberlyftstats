# Uber Lyft Stats

This project aims to visualize lyft/uber rides by crawling email receipts.
It is hosted here: https://zouhairm.github.io/lyftuberstats


You can see a sample of what the data looks like from my account (still needs to be implemented). If you would like to visualize your own data, click on the top right button to authenticate with Google and the app will fetch your data

This app is made possible thanks to the following packages:
* [Vue.js](https://github.com/vuejs/awesome-vue)
* [Plotly.js](https://plot.ly/javascript)
* [Vue-Plotly.js](https://david-desmaisons.github.io/vue-plotly)

 
For more technical details, check out this [Blog Post](https://zouhairm.github.io/lyftuber)

Note on Privacy and Data: The application relies on Google's OAuth2 workflow to access the emails, and therefore your login/password information is never shared with it either. Moreover, this application is **entirely** client side. This means that your data is not sent to a 3rd party server nor is it saved anywhere. If there is interest, it might in the future collect anonymized statistics (averaged values over time) from each user.

## Project setup
```
npm install
```
### Compiles and hot-reloads for development
```
npm run serve
```
### Compiles and minifies for production
```
npm run build
```