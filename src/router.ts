import { createRouter, createWebHistory } from "vue-router";
import { useSession } from "./stores/session";
import Login from "./views/Login.vue";
import Shell from "./views/Shell.vue";
import Dashboard from "./views/Dashboard.vue";
import Messages from "./views/Messages.vue";
import MessageDetail from "./views/MessageDetail.vue";
import Campaigns from "./views/Campaigns.vue";
import Contacts from "./views/Contacts.vue";
import Senders from "./views/Senders.vue";
import Developers from "./views/Developers.vue";
import Wallet from "./views/Wallet.vue";
import Invoices from "./views/Invoices.vue";
import Templates from "./views/Templates.vue";
import Team from "./views/Team.vue";
import Admin from "./views/Admin.vue";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/login", component: Login },
    {
      path: "/",
      component: Shell,
      children: [
        { path: "", component: Dashboard },
        { path: "messages", component: Messages },
        { path: "messages/:id", component: MessageDetail },
        { path: "campaigns", component: Campaigns },
        { path: "campaigns/:id", component: Campaigns },
        { path: "contacts", component: Contacts },
        { path: "sender-ids", component: Senders },
        { path: "templates", component: Templates },
        { path: "team", component: Team },
        { path: "developers/api-keys", component: Developers },
        { path: "developers/webhooks", component: Developers },
        { path: "billing/wallet", component: Wallet },
        { path: "billing/transactions", component: Wallet },
        { path: "billing/invoices", component: Invoices },
        { path: "admin/organizations", component: Admin },
        { path: "admin/queue-health", component: Admin },
        { path: "admin/sender-ids", component: Admin },
        { path: "admin/providers", component: Admin },
        { path: "admin/campaigns", component: Admin },
        { path: "admin/payments", component: Admin }
      ]
    }
  ]
});

router.beforeEach((to) => {
  const session = useSession();
  if (to.path !== "/login" && !session.signedIn) return "/login";
  if (to.path === "/login" && session.signedIn) return "/";
});
