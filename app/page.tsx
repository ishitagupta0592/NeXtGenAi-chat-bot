"use client";
import styles from "./page.module.css";
import { useChatStream } from "./hooks/useChatStream";
import { useEffect, useRef, useState } from "react";
import { createClient } from "./lib/supabase-browser";
import { User } from "@supabase/supabase-js";

export default function Home() {
  const { messages, input, setInput, isLoading, handleSubmit } = useChatStream();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check for existing session
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) {
        setAuthError(error.message);
      } else {
        setAuthError('Check your email to confirm your account!');
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setAuthError(error.message);
      }
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <div className={styles.page}>
      <div className={styles.mainContent}>
        <div className={styles.headerAnimation}>
          {/* Auth Button */}
          <div style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 100 }}>
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {user.user_metadata?.avatar_url && (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt="User"
                    style={{ width: '32px', height: '32px', borderRadius: '50%' }}
                  />
                )}
                <span style={{ color: 'white', fontSize: '0.9rem' }}>{user.email}</span>
                <button
                  onClick={handleSignOut}
                  className={styles.button}
                  style={{ width: 'auto', padding: '0.5rem 1rem', marginTop: 0, fontSize: '0.9rem' }}
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                {!showEmailForm ? (
                  <>
                    <button
                      onClick={handleSignIn}
                      className={styles.button}
                      style={{ width: 'auto', padding: '0.5rem 1rem', marginTop: 0, fontSize: '0.9rem' }}
                    >
                      Sign In with Google
                    </button>
                    <button
                      onClick={() => setShowEmailForm(true)}
                      style={{ background: 'none', border: 'none', color: '#0070f3', cursor: 'pointer', fontSize: '0.8rem' }}
                    >
                      Use Email Instead
                    </button>
                  </>
                ) : (
                  <form onSubmit={handleEmailAuth} style={{ background: '#222', padding: '1rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '250px' }}>
                    <input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #444', background: '#333', color: 'white' }}
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #444', background: '#333', color: 'white' }}
                    />
                    {authError && <span style={{ color: authError.includes('Check') ? '#4ade80' : '#f87171', fontSize: '0.8rem' }}>{authError}</span>}
                    <button type="submit" className={styles.button} style={{ width: '100%', marginTop: '0.5rem' }}>
                      {isSignUp ? 'Sign Up' : 'Sign In'}
                    </button>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                      <button type="button" onClick={() => setIsSignUp(!isSignUp)} style={{ background: 'none', border: 'none', color: '#0070f3', cursor: 'pointer' }}>
                        {isSignUp ? 'Have an account? Sign In' : 'No account? Sign Up'}
                      </button>
                      <button type="button" onClick={() => setShowEmailForm(false)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}>
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>

          <div className={styles.logo}>{/* You can place your logo here */}</div>
          <h1 className={styles.animatedTitle}>
            <span className={styles.titlePart}>Ai chat model </span>
            <span className={styles.titleAccent}> NeXtGenXsAi</span>
          </h1>
          <p className={styles.subtitle}>
            New era of AI chat model with openrouter
          </p>
        </div>

        <div className={styles.chatContainer}>
          <div className={styles.chatLayout}>
            {/* Messages Area */}
            <div className={styles.messagesArea} style={{ flex: 1, overflowY: 'auto', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {messages.length === 0 ? (
                <div className={styles.responsePlaceholder}>
                  <p>Ask a question to get started...</p>
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div key={index} className={`${styles.message} ${msg.role === 'user' ? styles.userMessage : styles.aiMessage}`}
                    style={{
                      alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                      backgroundColor: msg.role === 'user' ? '#0070f3' : '#333',
                      color: 'white',
                      padding: '10px 15px',
                      borderRadius: '10px',
                      maxWidth: '80%',
                      lineHeight: '1.5'
                    }}>
                    <strong>{msg.role === 'user' ? 'You: ' : 'AI: '}</strong>
                    <div className={styles.messageContent} style={{ whiteSpace: 'pre-wrap' }}>
                      {msg.content}
                    </div>
                  </div>
                ))
              )}
              {isLoading && (!messages.length || messages[messages.length - 1].role === 'user' || (messages[messages.length - 1].role === 'assistant' && !messages[messages.length - 1].content)) && (
                <div className={styles.typingIndicator}>
                  <div className={styles.bubble}></div>
                  <div className={styles.bubble}></div>
                  <div className={styles.bubble}></div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className={styles.inputSection}>
              <div className={styles.fileUploadArea}>
                <div className={styles.inputGroup}>
                  <textarea
                    className={styles.input}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message..."
                    id="chat-input"
                    disabled={isLoading}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit();
                      }
                    }}
                  />
                </div>
              </div>
              <button className={styles.button} onClick={() => handleSubmit()} disabled={isLoading}>
                {isLoading ? "Generating..." : "Send"}
              </button>
            </div>

          </div>
        </div>
      </div>

      <footer className={styles.footer}>
        <p>Powered by NextGenXsAI's Organization</p>
      </footer>
    </div>
  );
}