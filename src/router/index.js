import Vue from 'vue';
import Router from 'vue-router';
import Homepage from '@/components/Homepage';
import Bots from '@/components/Bots';
import Categories from '@/components/Categories';
import Witnesses from '@/components/Witnesses';

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
    {
      path: '/categories',
      name: 'categories',
      component: Categories,
    },
    {
      path: '/witnesses',
      name: 'Witnesses',
      component: Witnesses,
    },
  ],
});
