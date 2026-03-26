import { openDB, DBSchema, IDBPDatabase } from 'idb';

export interface Contact {
  id: string; // The WebRTC peer ID
  name: string;
  lastSeen?: number;
}

export type MessageType = 'text' | 'image' | 'voice';

export interface ChatMessage {
  id: string; // unique message id
  chatId: string; // the ID of the contact this message belongs to
  senderId: string; // 'me' or the contact's peer ID
  type: MessageType;
  content: string | Blob; // text string, or Blob for image/voice
  timestamp: number;
}

interface TunnelChatDB extends DBSchema {
  contacts: {
    key: string;
    value: Contact;
  };
  messages: {
    key: string;
    value: ChatMessage;
    indexes: { 'by-chatId': string; 'by-timestamp': number };
  };
}

let dbPromise: Promise<IDBPDatabase<TunnelChatDB>> | null = null;

if (typeof window !== 'undefined') {
  dbPromise = openDB<TunnelChatDB>('tunnelchat-db', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('contacts')) {
        db.createObjectStore('contacts', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('messages')) {
        const msgStore = db.createObjectStore('messages', { keyPath: 'id' });
        msgStore.createIndex('by-chatId', 'chatId');
        msgStore.createIndex('by-timestamp', 'timestamp');
      }
    },
  });
}

export async function getContacts(): Promise<Contact[]> {
  if (!dbPromise) return [];
  const db = await dbPromise;
  return db.getAll('contacts');
}

export async function saveContact(contact: Contact): Promise<void> {
  if (!dbPromise) return;
  const db = await dbPromise;
  await db.put('contacts', contact);
}

export async function deleteContact(id: string): Promise<void> {
  if (!dbPromise) return;
  const db = await dbPromise;
  await db.delete('contacts', id);
}

export async function getMessages(chatId: string): Promise<ChatMessage[]> {
  if (!dbPromise) return [];
  const db = await dbPromise;
  return db.getAllFromIndex('messages', 'by-chatId', chatId);
}

export async function saveMessage(message: ChatMessage): Promise<void> {
  if (!dbPromise) return;
  const db = await dbPromise;
  await db.put('messages', message);
}
