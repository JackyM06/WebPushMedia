import Vue from 'vue'
import VueRouter from 'vue-router'
import MainVue from 'views/Main/Main.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    component: MainVue
  },
  {
    path: '/pull',
    component: () => import('views/Result/Main.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
