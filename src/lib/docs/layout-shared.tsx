import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { appName } from "@/lib/docs/shared";

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: appName,
    },
    links: [
      {
        text: "Dashboard",
        url: "/dashboard",
      },
      {
        text: "SDK",
        url: "/docs/sdk",
      },
    ],
  };
}
