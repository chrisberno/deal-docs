import { Metadata } from "next";

import LoginClient from "./page-client";

const data = {
  description: "Login to Papermark",
  title: "Login | Papermark",
  url: "/login",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://www.papermark.com"),
  title: data.title,
  description: data.description,
  openGraph: {
    title: data.title,
    description: data.description,
    url: data.url,
    siteName: "Papermark",
    images: [
      {
        url: "https://github.com/chrisberno/deal-docs/raw/main/public/_static/meta-image.png",
        width: 800,
        height: 600,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: data.title,
    description: data.description,
    creator: "@chrisberno",
    images: ["https://github.com/chrisberno/deal-docs/raw/main/public/_static/meta-image.png"],
  },
};

export default function LoginPage() {
  return <LoginClient />;
}
