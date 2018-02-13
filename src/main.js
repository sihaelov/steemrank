// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.

import Vue from 'vue';
import infiniteScroll from 'vue-infinite-scroll';

// import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import lang from 'element-ui/lib/locale/lang/en';
import locale from 'element-ui/lib/locale';
import { Loading } from 'element-ui';

import App from './App';
import router from './router';

Vue.config.productionTip = false;
Vue.use(infiniteScroll);

// Vue.use(ElementUI, { lang });
locale.use(lang);
Vue.use(Loading.directive);

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App },
});
