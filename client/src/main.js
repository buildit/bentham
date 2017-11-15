// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import VueRouter from 'vue-router';
import VueLocalStorage from 'vue-ls';
import { paths } from './core/config';

Vue.use(VueRouter);
Vue.use(VueLocalStorage, {
  namespace: 'icarus__' // FIXME parametrise by stage
});
//Vue.config.productionTip = false
window.Vue = Vue;


require('bootstrap/dist/css/bootstrap.min.css');
require('./css/main.css');

import App from './App.vue'
import SlackPostLogin from "./components/SlackPostLogin.vue"
import GithubPostLogin from "./components/GithubPostLogin.vue"
import DropboxPostLogin from "./components/DropboxPostLogin.vue"

import Integrations from "./components/Integrations.vue"
Vue.component('integrations', Integrations)

console.log('Environment:', process.env)

const routes = [
  { path: '/', component: Integrations, props: paths },
  { path: '/post-login', component: SlackPostLogin, props: paths },
  { path: '/github-post-login', component: GithubPostLogin, props: paths },
  { path: '/dropbox-post-login', component: DropboxPostLogin, props: paths }, 
]

const router = new VueRouter({
  mode: 'history',  
  routes
})

console.log('Routing mode: ', router.mode)

/* eslint-disable no-new */
const vm = new Vue({
  router,  
  el: '#app',
  template: '<App/>',
  components: { App },
  // The following is required to pass props to the root instance 
  render: h => h(App, {
    props: paths
  }),
})


