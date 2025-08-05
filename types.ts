export interface ChatMessageData {
  role: 'user' | 'model';
  content: string;
  image?: string; // Base64 encoded image
  sources?: {
    uri: string;
    title: string;
  }[];
}
