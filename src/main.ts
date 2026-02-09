import "../src/assets/scss/index.scss";
import App from "./App.vue";
import router from "./router";
import { createApp } from "vue";
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

/* import the fontawesome core */
import { library } from "@fortawesome/fontawesome-svg-core";

/* import font awesome icon component */
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

/* import icons and add them to the Library */
import {
  faUserSecret,
  faBars,
  faAngleDown,
  faClock,
  faPhone,
  faMessage,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { faFacebook, faInstagram, faTwitter } from "@fortawesome/free-brands-svg-icons";
import {faXmark} from "@fortawesome/free-solid-svg-icons/faXmark";
import {faRectangleXmark} from "@fortawesome/free-solid-svg-icons/faRectangleXmark";


library.add(
  faUserSecret,
  faBars,
  faFacebook,
  faInstagram,
  faAngleDown,
  faClock,
  faInstagram,
  faTwitter,
  faPhone,
  faMessage,
  faUser,

  faXmark,
);

const app = createApp(App);

app.component("font-awesome-icon", FontAwesomeIcon);
app.use(pinia);
app.use(router);

app.mount("#app");
