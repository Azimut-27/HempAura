import { useEffect } from "react";
import { siteConfig } from "../config/siteConfig.js";

function setMeta(name, content, property = false) {
  const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
  let tag = document.head.querySelector(selector);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(property ? "property" : "name", name);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

export default function Seo({ title, description, path = "/", jsonLd }) {
  useEffect(() => {
    const fullTitle = title ? `${title} | HempAura` : "HempAura";
    const canonicalUrl = new URL(path, siteConfig.domain).toString();
    document.title = fullTitle;
    setMeta("description", description);
    setMeta("og:title", fullTitle, true);
    setMeta("og:description", description, true);
    setMeta("og:url", canonicalUrl, true);
    setMeta("og:type", "website", true);
    setMeta("twitter:card", "summary_large_image");

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;

    const id = "route-json-ld";
    document.getElementById(id)?.remove();
    if (jsonLd) {
      const script = document.createElement("script");
      script.id = id;
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }
    return () => document.getElementById(id)?.remove();
  }, [title, description, path, jsonLd]);

  return null;
}
