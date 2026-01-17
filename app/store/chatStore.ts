import { create } from 'zustand';

export interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

interface ChatState {
    messages: Message[];
    isLoading: boolean;
    input: string;
    addMessage: (message: Message) => void;
    updateLastMessage: (content: string) => void;
    setMessages: (messages: Message[]) => void;
    setIsLoading: (isLoading: boolean) => void;
    setInput: (input: string) => void;
}

export const useChatStore = create<ChatState>((set) => ({
    messages: [],
    isLoading: false,
    input: '',
    addMessage: (message) =>
        set((state) => ({ messages: [...state.messages, message] })),
    updateLastMessage: (content) =>
        set((state) => {
            const messages = [...state.messages];
            const lastMessage = messages[messages.length - 1];
            if (lastMessage && lastMessage.role === 'assistant') {
                lastMessage.content = content;
            }
            return { messages };
        }),
    setMessages: (messages) => set({ messages }),
    setIsLoading: (isLoading) => set({ isLoading }),
    setInput: (input) => set({ input }),
}));
