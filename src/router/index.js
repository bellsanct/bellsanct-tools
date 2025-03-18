// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";

// 各ページコンポーネントをインポート
import OverView from "@/pages/OverView.vue";
import CharCalc from "@/pages/CharCalc.vue";

const routes = [
  {
    path: "/",
    name: "OverView",
    component: OverView,
  },
  {
    path: "/CharCalc",
    name: "CharCalc",
    component: CharCalc,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
