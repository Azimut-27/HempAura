import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { languages, translations } from "../i18n/translations.js";

const STORAGE_KEY = "hempaura-language";
const LanguageContext = createContext(null);
const languageCodes = new Set(languages.map((language) => language.code));

function normalizeText(value) {
  return value.replace(/\s+/g, " ").trim();
}

function buildLookup() {
  const lookup = new Map();
  for (const [language, dictionary] of Object.entries(translations)) {
    for (const [source, translated] of Object.entries(dictionary)) {
      lookup.set(normalizeText(source), source);
      lookup.set(normalizeText(translated), source);
      lookup.set(normalizeText(`${translated} | HempAura`), `${source} | HempAura`);
      if (language !== "sl") lookup.set(normalizeText(`${source} | HempAura`), `${source} | HempAura`);
    }
  }
  return lookup;
}

const sourceLookup = buildLookup();

function translateString(value, language) {
  const normalized = normalizeText(value);
  if (!normalized) return value;
  const source = sourceLookup.get(normalized) || normalized;
  if (source.endsWith(" | HempAura")) {
    const titleSource = source.replace(" | HempAura", "");
    const translatedTitle =
      language === "sl" ? titleSource : translations[language]?.[titleSource] || titleSource;
    return `${translatedTitle} | HempAura`;
  }
  return language === "sl" ? source : translations[language]?.[source] || value;
}

function preserveSpacing(original, translated) {
  const leading = original.match(/^\s*/)?.[0] || "";
  const trailing = original.match(/\s*$/)?.[0] || "";
  return `${leading}${translated}${trailing}`;
}

function translateTree(root, language) {
  if (!root) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      if (["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA"].includes(parent.tagName)) {
        return NodeFilter.FILTER_REJECT;
      }
      if (!normalizeText(node.nodeValue || "")) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  for (const node of nodes) {
    const translated = translateString(node.nodeValue || "", language);
    if (translated !== node.nodeValue) {
      node.nodeValue = preserveSpacing(node.nodeValue || "", translated);
    }
  }

  for (const element of root.querySelectorAll("[aria-label], [title], [alt], [placeholder]")) {
    for (const attribute of ["aria-label", "title", "alt", "placeholder"]) {
      const value = element.getAttribute(attribute);
      if (!value) continue;
      const translated = translateString(value, language);
      if (translated !== value) element.setAttribute(attribute, translated);
    }
  }
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return languageCodes.has(saved) ? saved : "sl";
    } catch {
      return "sl";
    }
  });

  const setLanguage = useCallback((nextLanguage) => {
    const safeLanguage = languageCodes.has(nextLanguage) ? nextLanguage : "sl";
    setLanguageState(safeLanguage);
    try {
      localStorage.setItem(STORAGE_KEY, safeLanguage);
    } catch {
      // Language selection can still work without localStorage.
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    translateTree(document.documentElement, language);

    const observer = new MutationObserver((mutations) => {
      const targets = new Set();
      for (const mutation of mutations) {
        if (mutation.type === "characterData") {
          targets.add(mutation.target.parentElement);
        }
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) targets.add(node);
          if (node.nodeType === Node.TEXT_NODE) targets.add(node.parentElement);
        }
      }
      requestAnimationFrame(() => {
        for (const target of targets) translateTree(target, language);
        translateTree(document.head, language);
      });
    });

    observer.observe(document.documentElement, {
      childList: true,
      characterData: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      languages,
      setLanguage,
      t: (valueToTranslate) => translateString(valueToTranslate, language),
    }),
    [language, setLanguage]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
}

