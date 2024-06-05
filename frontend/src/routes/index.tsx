import { createBrowserRouter } from "react-router-dom";

import Root from "~/app/root";
import ErrorPage from "~/components/page-error";
import "~/styles/page/home.scss";

const routes = [
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        async lazy() {
          const { App } = await import("./app");
          return {
            Component: App,
          };
        },
      },
    ],
  },
  {
    path: "/search",
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        async lazy() {
          const { Search } = await import("./search");
          return {
            Component: Search,
          };
        },
      },
    ],
  },
];

export const router = createBrowserRouter(routes, {
  basename: import.meta.env.PROD ? "/mediacentre" : "/",
});
