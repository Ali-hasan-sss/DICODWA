import { promises as fs } from "fs";
import path from "path";
import type { Artwork, ContactMessage, Order } from "./types";

const dataDir = path.join(process.cwd(), "data");

async function readJson<T>(filename: string): Promise<T> {
  const filePath = path.join(dataDir, filename);
  const raw = await fs.readFile(filePath, "utf-8");
  return JSON.parse(raw) as T;
}

async function writeJson<T>(filename: string, data: T): Promise<void> {
  const filePath = path.join(dataDir, filename);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}

export async function getArtworks(): Promise<Artwork[]> {
  return readJson<Artwork[]>("artworks.json");
}

export async function getArtworkById(id: string): Promise<Artwork | undefined> {
  const artworks = await getArtworks();
  return artworks.find((a) => a.id === id);
}

export async function saveArtworks(artworks: Artwork[]): Promise<void> {
  await writeJson("artworks.json", artworks);
}

export async function upsertArtwork(artwork: Artwork): Promise<Artwork> {
  const artworks = await getArtworks();
  const index = artworks.findIndex((a) => a.id === artwork.id);
  if (index >= 0) {
    artworks[index] = artwork;
  } else {
    artworks.unshift(artwork);
  }
  await saveArtworks(artworks);
  return artwork;
}

export async function deleteArtwork(id: string): Promise<boolean> {
  const artworks = await getArtworks();
  const next = artworks.filter((a) => a.id !== id);
  if (next.length === artworks.length) return false;
  await saveArtworks(next);
  return true;
}

export async function markArtworkSold(id: string): Promise<void> {
  const artworks = await getArtworks();
  const artwork = artworks.find((a) => a.id === id);
  if (artwork) {
    artwork.status = "sold";
    await saveArtworks(artworks);
  }
}

export async function getOrders(): Promise<Order[]> {
  return readJson<Order[]>("orders.json");
}

export async function saveOrders(orders: Order[]): Promise<void> {
  await writeJson("orders.json", orders);
}

export async function createOrder(order: Order): Promise<Order> {
  const orders = await getOrders();
  orders.unshift(order);
  await saveOrders(orders);
  return order;
}

export async function updateOrderBySession(
  sessionId: string,
  patch: Partial<Order>
): Promise<Order | undefined> {
  const orders = await getOrders();
  const index = orders.findIndex((o) => o.stripeSessionId === sessionId);
  if (index < 0) return undefined;
  orders[index] = { ...orders[index], ...patch };
  await saveOrders(orders);
  return orders[index];
}

export async function getMessages(): Promise<ContactMessage[]> {
  return readJson<ContactMessage[]>("messages.json");
}

export async function createMessage(
  message: ContactMessage
): Promise<ContactMessage> {
  const messages = await getMessages();
  messages.unshift(message);
  await writeJson("messages.json", messages);
  return message;
}
