import Vue from 'vue';
import Router from 'vue-router';
import Homepage from '@/components/Homepage';
import Bots from '@/components/Bots';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'homepage',
      component: Homepage,
    },
    {
      path: '/bots',
      name: 'bots',
      component: Bots,
    },
  ],
});
