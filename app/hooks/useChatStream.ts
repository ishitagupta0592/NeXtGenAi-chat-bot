import { useChatStore } from '../store/chatStore';

export const useChatStream = () => {
    const {
        messages,
        input,
        setInput,
        addMessage,
        updateLastMessage,
        setIsLoading,
        isLoading,
    } = useChatStore();

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input;
        setInput('');
        addMessage({ role: 'user', content: userMessage });
        setIsLoading(true);

        try {
            // Create a placeholder for the assistant's message
            addMessage({ role: 'assistant', content: '' });

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMessage }),
            });

            if (!response.ok) {
                let errorMessage = 'Network response was not ok';
                try {
                    const errorText = await response.text();
                    if (errorText) errorMessage = errorText;
                    // Try parsing if it's JSON
                    try {
                        const json = JSON.parse(errorMessage);
                        if (json.error) errorMessage = json.error;
                    } catch { }
                } catch { }
                throw new Error(errorMessage);
            }
            if (!response.body) throw new Error('No response body');

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let done = false;
            let accumulatedResponse = '';

            while (!done) {
                const { value, done: doneReading } = await reader.read();
                done = doneReading;
                const chunkValue = decoder.decode(value, { stream: !done });
                accumulatedResponse += chunkValue;
                updateLastMessage(accumulatedResponse);
            }
        } catch (error) {
            console.error('Error in chat stream:', error);
            addMessage({ role: 'system', content: 'Error: Could not fetch response.' });
        } finally {
            setIsLoading(false);
        }
    };

    return {
        messages,
        input,
        setInput,
        isLoading,
        handleSubmit,
    };
};
