import { Home } from "../pages/Home";
import { Login } from "../pages/Login";
import { Register } from "../pages/Register";

const publicRoutes = [
  { path: "/", component: Login },
  { path: "/register", component: Register },
];

const privateRoutes = [{ path: "/homepage", component: Home }];

export { publicRoutes, privateRoutes };
