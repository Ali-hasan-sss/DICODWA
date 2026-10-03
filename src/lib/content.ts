import { promises as fs } from "fs";
import path from "path";
import { unstable_noStore as noStore } from "next/cache";
import en from "../../messages/en.json";
import ar from "../../messages/ar.json";
import type { LocaleCopy, MessageTree } from "./types";

const contentPath = path.join(process.cwd(), "data", "content.json");

const defaults = { en, ar } as unknown as LocaleCopy;

const hiddenKeys = new Set(["hero.title", "hero.subtitle", "hero.cta"]);

function isTree(value: unknown): value is MessageTree {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function mergeNamespace(
  base: MessageTree,
  overlay: MessageTree | undefined
): MessageTree {
  const result: MessageTree = {};
  for (const [key, value] of Object.entries(base)) {
    if (typeof value === "string") {
      const next = overlay?.[key];
      result[key] = typeof next === "string" ? next : value;
    } else if (isTree(value)) {
      const child = overlay?.[key];
      result[key] = mergeNamespace(value, isTree(child) ? child : undefined);
    }
  }
  return result;
}

export async function readContentFile(): Promise<LocaleCopy> {
  noStore();
  try {
    const raw = await fs.readFile(contentPath, "utf-8");
    const data = JSON.parse(raw) as Partial<LocaleCopy>;
    return {
      en: isTree(data.en) ? data.en : {},
      ar: isTree(data.ar) ? data.ar : {},
    };
  } catch {
    return { en: {}, ar: {} };
  }
}

export async function getLocaleMessages(locale: "en" | "ar") {
  const saved = await readContentFile();
  const base = defaults[locale];
  const merged = mergeNamespace(base, saved[locale]);
  merged.admin = base.admin;
  return merged;
}

function publicTree(tree: MessageTree): MessageTree {
  const result: MessageTree = {};
  for (const [section, value] of Object.entries(tree)) {
    if (section === "admin" || !isTree(value)) continue;
    const fields: MessageTree = {};
    for (const [key, field] of Object.entries(value)) {
      if (typeof field !== "string") continue;
      if (hiddenKeys.has(`${section}.${key}`)) continue;
      fields[key] = field;
    }
    result[section] = fields;
  }
  return result;
}

export async function getEditableCopy(): Promise<LocaleCopy> {
  const saved = await readContentFile();
  return {
    en: publicTree(mergeNamespace(defaults.en, saved.en)),
    ar: publicTree(mergeNamespace(defaults.ar, saved.ar)),
  };
}

function sanitizeNamespace(base: MessageTree, input: unknown): MessageTree {
  const source = isTree(input) ? input : {};
  const result: MessageTree = {};
  for (const [key, value] of Object.entries(base)) {
    if (typeof value !== "string") continue;
    const raw = source[key];
    result[key] = typeof raw === "string" ? raw.replace(/\u0000/g, "").slice(0, 8000) : value;
  }
  return result;
}

export function sanitizeCopy(input: unknown): LocaleCopy {
  const source = isTree(input) ? input : {};
  const result = { en: {} as MessageTree, ar: {} as MessageTree };
  for (const locale of ["en", "ar"] as const) {
    const localeInput = isTree(source[locale]) ? source[locale] : {};
    const base = defaults[locale];
    for (const [section, value] of Object.entries(base)) {
      if (section === "admin" || !isTree(value)) continue;
      const fields = sanitizeNamespace(value, localeInput[section]);
      for (const key of Object.keys(fields)) {
        if (hiddenKeys.has(`${section}.${key}`)) delete fields[key];
      }
      result[locale][section] = fields;
    }
  }
  return result;
}

export async function saveContent(copy: LocaleCopy): Promise<void> {
  await fs.writeFile(contentPath, JSON.stringify(copy, null, 2), "utf-8");
}
