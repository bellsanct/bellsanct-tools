// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";

// 各ページコンポーネントをインポート
import OverView from "@/pages/OverView.vue";
import CharCalc from "@/pages/CharCalc.vue";
import MinifyTool from "@/pages/MinifyTool.vue";

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
  {
    path: "/MinifyTool",
    name: "MinifyTool",
    component: MinifyTool,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
