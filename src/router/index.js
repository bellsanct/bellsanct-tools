// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";

// 各ページコンポーネントをインポート
import OverView from "@/pages/OverView.vue";
import CharCalc from "@/pages/CharCalc.vue";
import MinifyTool from "@/pages/MinifyTool.vue";
import JsonYaml from "@/pages/JsonYaml.vue";
import BAGiftQuiz from "@/pages/BAGiftQuiz.vue";
import SenmetsuPage from "@/pages/SenmetsuPage.vue";

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
  {
    path: "/JsonYaml",
    name: "JsonYaml",
    component: JsonYaml,
  },
  {
    path: "/BAGiftQuiz",
    name: "BAGiftQuiz",
    component: BAGiftQuiz,
  },
  {
    path: "/Senmetsu",
    name: "Senmetsu",
    component: SenmetsuPage,
    alias: ["/senmetsu"],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
