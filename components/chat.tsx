"use client";
import React, { useState, useRef, useEffect } from "react";
import { 
    MessageCircle, X, Send, Copy, Check, Trash2, Info, Loader2, Sparkles, Zap, AlertTriangle, MessageSquareText,
    FileText, Database, GitBranch, ArrowRight, ChevronDown, ExternalLink, FileSearch, Settings, Save, RotateCcw, 
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { loadComponents } from "next/dist/server/load-components";
import { set } from "date-fns";

// Add custom scrollbar hiding styles
const scrollbarHideStyles = `
    .scrollbar-hide::-webkit-scrollbar {
        display: none;
    }
    .scrollbar-hide {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }
`;

export interface ProcessReport {
  total_time: number;
  total_cost: number;
  total_tokens: number;
  num_processes: number;
  classification_step_time: number;
  decomposition_step: DecompositionStep;
  step_back_step_time: number;
  vector_retrieval_time: number;
  final_generation: FinalGeneration;
}

export interface DecompositionStep {
  total_time: number;
  queries: string[];
}

export interface FinalGeneration {
  time: number;
  cost: number;
  tokens: number;
}

// Slash command options
const SLASH_COMMANDS = [
    { id: "projects", label: "Show my projects", prompt: "Tell me about your projects" },
    { id: "experience", label: "Work experience", prompt: "What's your work experience?" },
    { id: "skills", label: "Technical skills", prompt: "What are your technical skills?" },
    { id: "education", label: "Education background", prompt: "Tell me about your education" },
    { id: "contact", label: "Contact information", prompt: "How can I contact you?" },
    { id: "navigate", label: "Navigate page", prompt: "Navigate between sections", isSpecial: true },
];

const NAVIGATION_OPTIONS = [
    { id: "home", label: "Home", hash: "#home" },
    { id: "about", label: "About", hash: "#about" },
    { id: "experience", label: "Experience", hash: "#experience" },
    { id: "projects", label: "Projects", hash: "#projects" },
    { id: "contact", label: "Contact", hash: "#contact" },
];

const stepMessages = [
    "thinking...",
    "classifying query complexity...",
    "decomposing your question...",
    "generating step-back prompts...",
    "searching vector database...",
    "retrieving relevant documents...",
    "analyzing context chunks...",
    "synthesizing information...",
    "crafting response..."
];

export default function Chatbox() {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
    const [hoveredMessageIndex, setHoveredMessageIndex] = useState<number | null>(null);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const [showSlashMenu, setShowSlashMenu] = useState(false);
    const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [showNavigationMenu, setShowNavigationMenu] = useState(false);
    const [selectedNavIndex, setSelectedNavIndex] = useState(0);
    const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([
        "What projects have you worked on?",
        "Tell me about your technical skills",
        "What's your experience with React?",
    ]);
    const [settingsView, setSettingsView] = useState(false);
    const [activeView, setActiveView] = useState<'chat' | 'trace'>('chat');
    const [langChainURl, setLangChainURl] = useState<string | null>(null);
    const [langChainOutput, setLangChainOutput] = useState<ProcessReport | null>(null);
    const [isAtBottom, setIsAtBottom] = useState(true);
    const [showScrollButton, setShowScrollButton] = useState(false);

    const [saveChatHistory, setSaveChatHistory] = useState(false);
    const [enableTracing, setEnableTracing] = useState(true);
    const [autoFetchTrace, setAutoFetchTrace] = useState(false);
    const [loadingTrace, setLoadingTrace] = useState(false);
    const [maxTokens, setMaxTokens] = useState(3000);
    const [temperature, setTemperature] = useState(0.5);
    const [retrievalK, setRetrievalK] = useState(6);

    const [showRateLimitError, setShowRateLimitError] = useState(false);
    const [ragStepIndex, setRagStepIndex] = useState(0);
    const [fadeIn, setFadeIn] = useState(true);

    useEffect(() => {
    if (isLoading) {
            setRagStepIndex(0);
            setFadeIn(true);
            
            const interval = setInterval(() => {
                setRagStepIndex((prev) => {
                    // If we are already at the last message, stop incrementing
                    if (prev >= stepMessages.length - 1) {
                        return prev;
                    }

                    // Otherwise, perform the fade transition
                    setFadeIn(false);
                    setTimeout(() => {
                        setRagStepIndex(prev + 1);
                        setFadeIn(true);
                    }, 200);

                    return prev + 1;
                });
            }, 2500);
            
            return () => clearInterval(interval);
        }
    }, [isLoading, stepMessages.length]);
    
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const lastMessageRef = useRef<HTMLInputElement>(null);
    const settingsScrollRef = useRef<HTMLDivElement>(null);

    
    const handleSaveSettings = () => {
        localStorage.setItem('chatbot-settings', JSON.stringify({
            enableTracing,
            autoFetchTrace,
            maxTokens,
            temperature,
            retrievalK,
            messages
        }));
    };

    const handleResetSettings = () => {
        setEnableTracing(true);
        setAutoFetchTrace(false);
        setMaxTokens(3000);
        setTemperature(0.5);
        setRetrievalK(6);
        setSaveChatHistory(false);
        if (localStorage.getItem('chatbot-settings')) {
            localStorage.removeItem('chatbot-settings');
        }
    };

    useEffect(() => {
        if (localStorage.getItem('chatbot-settings')) {
            const savedSettings = JSON.parse(localStorage.getItem('chatbot-settings') || '{}');
            setEnableTracing(savedSettings.enableTracing ?? true);
            setAutoFetchTrace(savedSettings.autoFetchTrace ?? false);
            setMaxTokens(savedSettings.maxTokens ?? 3000);
            setTemperature(savedSettings.temperature ?? 0.5);
            setRetrievalK(savedSettings.retrievalK ?? 6);
            if (savedSettings.messages) {
                // setMessages(savedSettings.messages);
            }
        }
    }, [])

    useEffect(() => {
        if (saveChatHistory) {
            const savedSettings = JSON.parse(localStorage.getItem('chatbot-settings') || '{}');
            savedSettings.messages = messages;
            localStorage.setItem('chatbot-settings', JSON.stringify(savedSettings));
        }
    }, [saveChatHistory])

    // Initial greeting when chat opens
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            const greeting = {
                role: "assistant",
                content: "hey, i'm proxy ai, think of me Max's brain in bot form. Ask me anything about his projects, experience, or skills—or just type / for some quick shortcuts!",
            };
            setMessages([greeting]);
        }
    }, [isOpen, messages.length]);

    // Auto-scroll to bottom on new messages and when opening chat
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    // Track scroll position to show/hide suggestions
    const handleScroll = () => {
        if (scrollRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
            const isBottom = scrollHeight - scrollTop - clientHeight < 30;
            setIsAtBottom(isBottom);
            setShowScrollButton(!isBottom);
        }
    };

    // Function to scroll to bottom
    const scrollToBottom = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    };

    // Scroll to top when settings opens
    useEffect(() => {
        if (settingsView && settingsScrollRef.current) {
            settingsScrollRef.current.scrollTop = 0;
        }
    }, [settingsView]);

    // Scroll to top when trace view opens
    useEffect(() => {
        if (activeView === 'trace' && scrollRef.current) {
            scrollRef.current.scrollTop = 0;
        }
    }, [activeView]);

    // Reset scroll when chat opens
    useEffect(() => {
        if (isOpen && activeView === 'chat' && !settingsView && scrollRef.current) {
            requestAnimationFrame(() => {
                if (scrollRef.current) {
                    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
                }
            });
        }
    }, [isOpen, activeView, settingsView]);

    // Smooth scroll for new messages only
    useEffect(() => {
        if (activeView === 'chat' && !settingsView && lastMessageRef.current && messages.length > 0) {
            lastMessageRef.current.scrollTo({
                top: lastMessageRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages]);

    // Handle slash commands
    useEffect(() => {
        if (input.startsWith("/navigate")) {
            setShowNavigationMenu(true);
            setShowSlashMenu(false);
        } else if (input.startsWith("/")) {
            setShowSlashMenu(true);
            setShowNavigationMenu(false);
            setSelectedCommandIndex(0);
        } else {
            setShowSlashMenu(false);
        }
    }, [input]);

    useEffect(() => {
        setInput("");
        setShowNavigationMenu(false);
        setShowSlashMenu(false);
        setActiveView('chat');
        setSettingsView(false);
    }, [isOpen])

    // Filter slash commands based on input
    const getFilteredCommands = () => {
        if (!input.startsWith("/")) return SLASH_COMMANDS;
        
        const searchTerm = input.slice(1).toLowerCase();
        if (!searchTerm) return SLASH_COMMANDS;
        
        return SLASH_COMMANDS.filter((cmd) => {
            const matchesLabel = cmd.label.toLowerCase().includes(searchTerm);
            const matchesPrompt = cmd.prompt.toLowerCase().includes(searchTerm);
            return matchesLabel || matchesPrompt;
        });
    };

    const filteredCommands = getFilteredCommands();

    const getFilteredNavigation = () => {
        if (!input.startsWith("/navigate ")) return NAVIGATION_OPTIONS;

        const searchTerm = input.slice(10).toLowerCase();
        if (!searchTerm) return NAVIGATION_OPTIONS;

        return NAVIGATION_OPTIONS.filter((cmd) => {
            const matchesLabel = cmd.label.toLowerCase().includes(searchTerm);
            return matchesLabel;
        });
    }

    const filteredNavCommands = getFilteredNavigation();

    const fetchTraceInBackground = async (runId: string) => {
        try {
            const traceRes = await fetch(`/api/trace?runId=${runId}&enableTracing=${enableTracing}&autoFetchTrace=${autoFetchTrace}`);
            const { traceUrl, output } = await traceRes.json();
            
            if (traceUrl) setLangChainURl(traceUrl);
            if (output) setLangChainOutput(output);
            setLoadingTrace(false);
        } catch (e) {
            console.error("Background trace fetch failed:", e);
        }
    };

    const handleSend = async (messageToSend?: string) => {
        const message = messageToSend || input;
        if (!message.trim() || isLoading) return;

        const userMsg = { role: "user", content: message };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setShowSlashMenu(false);
        setIsLoading(true);
        setLoadingTrace(true);

        const ragSettings = {
            temperature,
            retrievalK,
            maxTokens
        };

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ question: message, messages, ragSettings }),
            });
            const data = await res.json();
            if (res.status === 429) {
                setShowRateLimitError(true);
                setTimeout(() => setShowRateLimitError(false), 5000);
                setMessages((prev) => prev.slice(0, -1));
                setIsLoading(false);
                return;
            }
            if (data?.answer) {
                const newMessages = [...messages, userMsg, { role: "assistant", content: data.answer }];
                setMessages(newMessages);
                fetchSuggestions(newMessages);

                setTimeout(() => {
                    if (lastMessageRef.current) {
                        lastMessageRef.current.scrollTop = lastMessageRef.current.scrollHeight;
                    }
                }, 50);
            }
            setIsLoading(false);
            if (data?.runId) {
                fetchTraceInBackground(data.runId);
            }
        } catch (err) {
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: "uh oh, looks like something went wrong. mind asking that one more time?" },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchSuggestions = async (messageHistory: { role: string; content: string }[]) => {
        try {
            const res = await fetch("/api/suggestion", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: messageHistory }),
            });
            const data = await res.json();
            
            if (data.questions && Array.isArray(data.questions)) {
                setSuggestedQuestions(data.questions);
            }
        } catch (err) {
            console.error("Failed to fetch suggestions:", err);
        }
    };

    const handleCopy = async (content: string, index: number) => {
        await navigator.clipboard.writeText(content);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const handleClearChat = () => {
        setMessages([
            {
                role: "assistant",
                content: "hey there! 👋 I'm the digital twin. ask me anything about projects, experience, or skills. try typing `/` for quick suggestions!",
            },
        ]);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (showNavigationMenu) {
            if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelectedNavIndex((prev) => (prev + 1) % NAVIGATION_OPTIONS.length);
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelectedNavIndex((prev) => (prev - 1 + NAVIGATION_OPTIONS.length) % NAVIGATION_OPTIONS.length);
            } else if (e.key === "Tab") {
                e.preventDefault();
                setSelectedNavIndex((prev) => (prev + 1) % NAVIGATION_OPTIONS.length);
            } else if (e.key === "Enter") {
                e.preventDefault();
                const selected = NAVIGATION_OPTIONS[selectedNavIndex];
                selectNavigation(selected);
            } else if (e.key === "Escape") {
                setShowNavigationMenu(false);
                setInput("");
            }
        } else if (showSlashMenu) {
            const commands = filteredCommands;
            if (commands.length === 0) return;
            
            if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelectedCommandIndex((prev) => (prev + 1) % commands.length);
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelectedCommandIndex((prev) => (prev - 1 + commands.length) % commands.length);
            } else if (e.key === "Tab") {
                e.preventDefault();
                setSelectedCommandIndex((prev) => (prev + 1) % commands.length);
            } else if (e.key === "Enter") {
                e.preventDefault();
                if (selectedCommandIndex < commands.length) {
                    const selected = commands[selectedCommandIndex];
                    selectCommand(selected);
                }
            } else if (e.key === "Escape") {
                setShowSlashMenu(false);
                setInput("");
            }
        } else {
            if (e.key === "Enter") {
                handleSend();
            } else if (e.key === "Escape") {
                setIsOpen(false);
            }
        }
    };

    const selectCommand = (command: typeof SLASH_COMMANDS[0]) => {
        if (command.id === "navigate") {
            setShowSlashMenu(false);
            setShowNavigationMenu(true);
            setSelectedNavIndex(0);
            setInput("/navigate ");
        } else {
            setInput("");
            setShowSlashMenu(false);
            handleSend(command.prompt);
        }
    };

    const selectNavigation = (nav: typeof NAVIGATION_OPTIONS[0]) => {
        setShowNavigationMenu(false);
        setInput("");
        
        // Scroll to the section
        const element = document.querySelector(nav.hash);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Inject scrollbar hide styles */}
            <style>{scrollbarHideStyles}</style>
            
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-96 h-[550px] bg-card border border-border rounded-2xl shadow-2xl flex flex-col animate-in slide-in-from-bottom-8 fade-in duration-300 overflow-hidden">
                    {/* Header */}
                    <div className="relative rounded-t-2xl p-4 bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground flex justify-between items-center flex-shrink-0">
                        {/* Animated background particles */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <style>{`
                                @keyframes float-particle {
                                    0% { transform: translateY(10px) translateX(0); opacity: 0; }
                                    20% { opacity: 0.4; }
                                    80% { opacity: 0.4; }
                                    100% { transform: translateY(-50px) translateX(15px); opacity: 0; }
                                }
                            `}</style>
                            
                            {[...Array(20)].map((_, i) => (
                                <div
                                    key={i}
                                    className="absolute bg-white rounded-full will-change-transform"
                                    style={{
                                        // Variation in size
                                        width: `${(i % 3) + 2}px`,
                                        height: `${(i % 3) + 2}px`,
                                        // Random-ish distribution
                                        top: `${(i * 7) % 100}%`,
                                        left: `${(i * 13) % 100}%`,
                                        // Soften the edges
                                        filter: 'blur(0.4px)',
                                        boxShadow: '0 0 4px rgba(255, 255, 255, 0.4)',
                                        // Staggered timing
                                        animation: `float-particle ${4 + (i % 4)}s linear infinite`,
                                        animationDelay: `${i * 0.3}s`,
                                    }}
                                />
                            ))}
                        </div>
                        
                        {/* Left: Branding */}
                        <div className="flex items-center gap-3 relative z-10">
                            {/* Pulsing indicator with glow */}
                            <div className="relative">
                                <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse"></div>
                                <div className="absolute inset-0 w-2.5 h-2.5 bg-green-400 rounded-full animate-ping"></div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-lg tracking-tight">Proxy AI</span>
                            </div>
                        </div>

                        {/* Center: View Tabs (Segmented Control) */}
                        <div className="relative flex items-center gap-1 bg-black/20 backdrop-blur-sm rounded-full p-1 border border-white/10 shadow-lg z-10">
                            {/* Sliding background indicator */}
                            <div 
                                className={`absolute top-1 bottom-1 w-[calc(50%-10px)] bg-white/20 rounded-full backdrop-blur-sm border border-white/20 shadow-lg transition-transform duration-300 ease-out ${
                                    !settingsView && activeView === 'chat' 
                                        ? 'translate-x-1' 
                                        : !settingsView && activeView === 'trace' 
                                            ? 'translate-x-[calc(100%+8px)]' 
                                            : 'hidden'
                                }`}
                            />
                            
                            <button
                                onClick={() => {setActiveView('chat'); setSettingsView(false)}}
                                className={`relative px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-300 z-10 ${
                                    !settingsView && activeView === 'chat' 
                                        ? 'text-white' 
                                        : 'text-white/60 hover:text-white/80'
                                }`}
                            >
                                <span className="relative flex items-center gap-1.5">
                                    <MessageCircle size={14} />
                                    Chat
                                </span>
                            </button>
                            
                            <button
                                onClick={() => {setActiveView('trace'); setSettingsView(false)}}
                                className={`relative px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-300 z-10 ${
                                    !settingsView && activeView === 'trace' 
                                        ? 'text-white' 
                                        : 'text-white/60 hover:text-white/80'
                                }`}
                            >
                                <span className="relative flex items-center gap-1.5">
                                    <Zap size={14} />
                                    Trace
                                </span>
                            </button>
                        </div>
                        
                        {/* Right: Actions */}
                        <div className="flex gap-1.5 relative z-10">
                            <button
                                onClick={() => settingsView ? setSettingsView(false) : setSettingsView(true)}
                                className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 group ${
                                    settingsView
                                        ? 'bg-white/20 text-white' 
                                        : 'hover:bg-white/10 text-white/80'
                                }`}
                                title="Settings"
                            >
                                <Settings size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                            </button>
                        </div>

                        {/* Bottom blur effect */}
                        <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-b from-transparent to-primary/20 backdrop-blur-sm pointer-events-none"></div>
                    </div>

                    {/* Messages Container */}
                    <div className="flex-1 flex flex-col overflow-hidden bg-background/50 relative">
                        { settingsView ? (
                            <>
                                <div ref={settingsScrollRef} className="flex-1 overflow-y-auto p-4 bg-background scrollbar-hide">
                                    <div className="max-w-2xl mx-auto space-y-6">
                                        {/* Header */}
                                        <div>
                                            <h2 className="text-xl font-bold flex items-center gap-2 mb-1">
                                                <Settings size={20} className="text-primary" />
                                                Settings
                                            </h2>
                                            <p className="text-sm text-muted-foreground">
                                                Configure your chatbot preferences and integrations
                                            </p>
                                        </div>

                                        <div className="p-4 bg-card border border-border rounded-xl">
                                            <div className="flex items-start gap-3 mb-3">
                                                <div className="p-2 bg-blue-500/10 rounded-lg">
                                                    <MessageSquareText size={20} className="text-yellow-500" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-sm mb-1">Message Management </h3>
                                                    <p className="text-xs text-muted-foreground">
                                                        Control how your conversation data is stored and managed for this session.
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="space-y-3">

                                                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                                    <div>
                                                        <div className="text-sm font-medium">Persistent History</div>
                                                        <div className="text-xs text-muted-foreground">Retain context across uses</div>
                                                    </div>
                                                    <button
                                                        onClick={() => setSaveChatHistory(true)}
                                                        className="p-2 hover:bg-white/20 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 group"
                                                        title="Save chat"
                                                    >
                                                        <Save size={20} className="group-hover:rotate-12 transition-transform text-blue-500" />
                                                    </button>
                                                </div>

                                                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                                    <div>
                                                        <div className="text-sm font-medium">Purge History</div>
                                                        <div className="text-xs text-muted-foreground">Clear context and session memory</div>
                                                    </div>
                                                    <button
                                                        onClick={handleClearChat}
                                                        className="p-2 hover:bg-white/20 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 group"
                                                        title="Clear chat"
                                                    >
                                                        <Trash2 size={20} className="group-hover:rotate-12 transition-transform text-red-500" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* LangSmith Integration */}
                                        <div className="space-y-4">
                                            <div className="p-4 bg-card border border-border rounded-xl">
                                                <div className="flex items-start gap-3 mb-4">
                                                    <div className="p-2 bg-primary/10 rounded-lg">
                                                        <Zap size={20} className="text-blue-500" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-sm mb-1">LangSmith Integration</h3>
                                                        <p className="text-xs text-muted-foreground">
                                                            Connect to LangSmith for execution tracing and debugging
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                                        <div>
                                                        <div className="text-sm font-medium">Enable Tracing</div>
                                                        <div className="text-xs text-muted-foreground">View full execution flow URL</div>
                                                        </div>
                                                        <label className="relative inline-flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={enableTracing}
                                                            onChange={(e) => setEnableTracing(e.target.checked)}
                                                            className="sr-only peer"
                                                        />
                                                        <div className="w-11 h-6 bg-muted-foreground/20 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                                        </label>
                                                    </div>

                                                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                                        <div>
                                                        <div className="text-sm font-medium">Auto-fetch Traces</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            <p>
                                                                Automatically loads local trace data 
                                                                (may increase latency)
                                                            </p>
                                                        </div>
                                                        </div>
                                                        <label className="relative inline-flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={autoFetchTrace}
                                                            onChange={(e) => setAutoFetchTrace(e.target.checked)}
                                                            className="sr-only peer"
                                                        />
                                                        <div className="w-11 h-6 bg-muted-foreground/20 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* RAG Configuration */}
                                        <div className="space-y-4">
                                            <div className="p-4 bg-card border border-border rounded-xl">
                                                <div className="flex items-start gap-3 mb-4">
                                                    <div className="p-2 bg-green-500/10 rounded-lg">
                                                        <Database size={20} className="text-green-500" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-sm mb-1">RAG Configuration</h3>
                                                        <p className="text-xs text-muted-foreground">
                                                        Adjust retrieval and generation parameters
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="text-xs font-medium mb-2 block flex items-center justify-between">
                                                            <span>Retrieval K (chunks to fetch)</span>
                                                            <span className="text-primary font-mono">{retrievalK}</span>
                                                        </label>
                                                        <input
                                                            type="range"
                                                            min="1"
                                                            max="10"
                                                            value={retrievalK}
                                                            onChange={(e) => setRetrievalK(parseInt(e.target.value))}
                                                            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                                                        />
                                                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                                            <span>1</span>
                                                            <span>10</span>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="text-xs font-medium mb-2 block flex items-center justify-between">
                                                            <span>Temperature</span>
                                                            <span className="text-primary font-mono">{temperature.toFixed(1)}</span>
                                                        </label>
                                                        <input
                                                            type="range"
                                                            min="0"
                                                            max="2"
                                                            step="0.1"
                                                            value={temperature}
                                                            onChange={(e) => setTemperature(parseFloat(e.target.value))}
                                                            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                                                        />
                                                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                                            <span>Focused (0)</span>
                                                            <span>Creative (2)</span>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="text-xs font-medium mb-2 block flex items-center justify-between">
                                                            <span>Max Tokens</span>
                                                            <span className="text-primary font-mono">{maxTokens}</span>
                                                        </label>
                                                        <input
                                                            type="range"
                                                            min="500"
                                                            max="4000"
                                                            step="100"
                                                            value={maxTokens}
                                                            onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                                                            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                                                        />
                                                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                                            <span>500</span>
                                                            <span>4000</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Messages */}
                                        

                                        {/* About */}
                                        <div className="p-4 bg-card border border-border rounded-xl">
                                            <div className="flex items-start gap-3 mb-3">
                                                <div className="p-2 bg-blue-500/10 rounded-lg">
                                                    <Info size={20} className="text-gray-500" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-sm mb-1">About</h3>
                                                    <p className="text-xs text-muted-foreground">
                                                        Advanced RAG chatbot architecture
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex-1 flex overflow-y-auto p-2 scrollbar-hide">
                                                <div className="w-80 m-auto p-4 bg-background text-foreground border border-border rounded-lg shadow-2xl shadow-[0_0_25px_-5px_rgba(59,130,246,0.3)] ring-1 ring-primary/20 transition-all duration-200 z-[100] text-xs leading-relaxed pointer-events-none group-hover:pointer-events-auto">
                                                    <div className="flex items-center gap-2 font-semibold mb-3">
                                                        <FileSearch size={14} className="text-primary" />
                                                        <span>LangChain RAG Pipeline</span>
                                                    </div>
                                                    
                                                    {/* Visual Flow */}
                                                    <div className="space-y-2 mb-3">
                                                        {/* Step 1 */}
                                                        <div className="flex items-center gap-2 text-[11px]">
                                                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                                                            <FileText size={12} className="text-primary" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="font-medium text-foreground">Docling Parser</div>
                                                            <div className="text-muted-foreground">PDF/Doc → Structured Data</div>
                                                        </div>
                                                        </div>
                                                        
                                                        <div className="ml-3 h-4 w-0.5 bg-gradient-to-b from-primary/50 to-transparent"></div>
                                                        
                                                        {/* Step 2 */}
                                                        <div className="flex items-center gap-2 text-[11px]">
                                                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                                                            <Database size={12} className="text-primary" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="font-medium text-foreground">Pinecone Vector DB</div>
                                                            <div className="text-muted-foreground">Dense embeddings stored</div>
                                                        </div>
                                                        </div>
                                                        
                                                        <div className="ml-3 h-4 w-0.5 bg-gradient-to-b from-primary/50 to-transparent"></div>
                                                        
                                                        {/* Query Classification Branch */}
                                                        <div className="flex items-center gap-2 text-[11px]">
                                                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                                                            <GitBranch size={12} className="text-primary" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="font-medium text-foreground">Query Classification</div>
                                                            <div className="text-muted-foreground">Simple vs Complex routing</div>
                                                        </div>
                                                        </div>
                                                        
                                                        <div className="ml-8 space-y-2 pl-4 border-l-2 border-dashed border-primary/30">
                                                        {/* Simple Path */}
                                                        <div className="text-[10px]">
                                                            <div className="flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
                                                            <ArrowRight size={10} />
                                                            <span>Simple: k-chunk retrieval → LLM</span>
                                                            </div>
                                                        </div>
                                                        
                                                        {/* Complex Path */}
                                                        <div className="text-[10px] space-y-1">
                                                            <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400 font-medium">
                                                            <ArrowRight size={10} />
                                                            <span>Complex: Advanced techniques</span>
                                                            </div>
                                                            <div className="ml-3 space-y-0.5 text-muted-foreground">
                                                            <div>• Query decomposition (recursive Q&A)</div>
                                                            <div>• Step-back prompting</div>
                                                            <div>• Query rephrasing</div>
                                                            <div>• Multi-context fusion → LLM</div>
                                                            </div>
                                                        </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="mt-3 pt-2 border-t border-border text-[10px] text-muted-foreground flex items-center justify-between">
                                                        <span className="flex items-center gap-1">
                                                        <Sparkles size={10} className="text-primary" />
                                                        Adaptive retrieval strategy
                                                        </span>
                                                    </div>
                                                    
                                                    {/* Tooltip Arrow */}
                                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-background border-r border-b border-border rotate-45"></div>
                                                </div>
                                            </div>

                                            {/* Research Papers */}
                                            <div className="space-y-2 p-4 bg-background border border-border rounded-lg mt-4">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <p className="text-xs font-semibold text-foreground">Research Foundation</p>
                                                </div>
                                                
                                                <div className="space-y-2">
                                                    {/* Paper 1: Query Decomposition */}
                                                    <a
                                                    
                                                        href="https://arxiv.org/pdf/2205.10625"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="group block p-3 bg-gradient-to-r from-purple-500/5 to-purple-500/0 border border-purple-500/20 rounded-lg hover:border-purple-500/40 hover:from-purple-500/10 transition-all duration-200"
                                                    >
                                                        <div className="flex items-start gap-2">
                                                            <div className="p-1.5 bg-purple-500/10 rounded flex-shrink-0 mt-0.5">
                                                                <FileText size={12} className="text-purple-400" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <span className="text-xs font-medium text-purple-400 group-hover:text-purple-300 transition-colors">
                                                                        Least-to-Most Prompting
                                                                    </span>
                                                                    <ExternalLink size={10} className="text-purple-400/60 group-hover:text-purple-400 transition-colors" />
                                                                </div>
                                                                <p className="text-[10px] text-muted-foreground leading-relaxed">
                                                                    Zhou et al. (2022) - Query decomposition technique
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </a>

                                                    {/* Paper 2: Step-back Prompting */}
                                                    <a
                                                        href="https://arxiv.org/pdf/2310.06117"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="group block p-3 bg-gradient-to-r from-green-500/5 to-green-500/0 border border-green-500/20 rounded-lg hover:border-green-500/40 hover:from-green-500/10 transition-all duration-200"
                                                    >
                                                        <div className="flex items-start gap-2">
                                                            <div className="p-1.5 bg-green-500/10 rounded flex-shrink-0 mt-0.5">
                                                                <FileText size={12} className="text-green-400" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <span className="text-xs font-medium text-green-400 group-hover:text-green-300 transition-colors">
                                                                        Take a Step Back
                                                                    </span>
                                                                    <ExternalLink size={10} className="text-green-400/60 group-hover:text-green-400 transition-colors" />
                                                                </div>
                                                                <p className="text-[10px] text-muted-foreground leading-relaxed">
                                                                    Zheng et al. (2023) - Abstract reasoning via step-back
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </a>

                                                    {/* Paper 3: Query Rewriting */}
                                                    <a
                                                        href="https://arxiv.org/pdf/2311.04205"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="group block p-3 bg-gradient-to-r from-orange-500/5 to-orange-500/0 border border-orange-500/20 rounded-lg hover:border-orange-500/40 hover:from-orange-500/10 transition-all duration-200"
                                                    >
                                                        <div className="flex items-start gap-2">
                                                            <div className="p-1.5 bg-orange-500/10 rounded flex-shrink-0 mt-0.5">
                                                                <FileText size={12} className="text-orange-400" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <span className="text-xs font-medium text-orange-400 group-hover:text-orange-300 transition-colors">
                                                                        REWRITE-RETRIEVE-READ
                                                                    </span>
                                                                    <ExternalLink size={10} className="text-orange-400/60 group-hover:text-orange-400 transition-colors" />
                                                                </div>
                                                                <p className="text-[10px] text-muted-foreground leading-relaxed">
                                                                    Ma et al. (2023) - Query rewriting for better retrieval
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </a>
                                                </div>

                                                {/* Citation Note */}
                                                <div className="mt-3 p-2 bg-muted/30 rounded-lg border border-border/50">
                                                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                                                        <span className="font-medium text-foreground">Implementation:</span> This system combines techniques from these papers to create an adaptive RAG pipeline with dynamic query handling.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-3">
                                            <button
                                                onClick={handleSaveSettings}
                                                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                            >
                                                <Save size={16} />
                                                Save Settings
                                            </button>
                                            <button
                                                onClick={handleResetSettings}
                                                className="px-4 py-2.5 bg-muted hover:bg-muted/80 text-foreground rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                            >
                                                <RotateCcw size={16} />
                                                Reset
                                            </button>
                                        </div>

                                        {/* Footer Links */}
                                        <div className="flex gap-4 justify-center text-xs text-muted-foreground pt-4 border-t border-border">
                                            <a href="https://github.com/maxtmiller?tab=repositories" target="_blank" className="hover:text-primary transition-colors flex items-center gap-1">
                                                Check out my other projects!
                                                <ExternalLink size={10} />
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : activeView === 'chat' ? (
                            <>
                                {/* Scrollable Messages */}
                                <div 
                                    ref={scrollRef}
                                    className="flex-1 overflow-y-auto overflow-x-hidden p-4 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 space-y-3"
                                    onScroll={handleScroll}
                                >
                                    {messages.map((m, i) => {

                                        const isLast = i === messages.length - 1;

                                        return (
                                            <div
                                                key={i}
                                                ref={isLast ? lastMessageRef : null}
                                                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} animate-in slide-in-from-bottom-2 fade-in duration-300`}
                                                style={{ animationDelay: `${i * 50}ms` }}
                                                onMouseEnter={() => setHoveredMessageIndex(i)}
                                                onMouseLeave={() => setHoveredMessageIndex(null)}
                                            >
                                                <div className="relative group max-w-[85%]">
                                                    <div
                                                        className={`p-3 rounded-2xl text-sm transition-all duration-200 ${
                                                        m.role === "user"
                                                            ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground shadow-md"
                                                            : "bg-muted border border-border shadow-sm hover:shadow-md"
                                                        }`}
                                                    >
                                                        <div className="prose prose-sm prose-p:text-[13px] dark:prose-invert prose-p:leading-relaxed prose-p:my-1 max-w-none">
                                                            <ReactMarkdown
                                                                components={{
                                                                    // Add specific styles for headers
                                                                    h3: ({node, ...props}) => <h3 className="text-base font-bold mb-2 mt-4 text-foreground" {...props} />,
                                                                    h2: ({node, ...props}) => <h2 className="text-lg font-bold mb-3 mt-5 text-foreground" {...props} />,
                                                                    strong: ({node, ...props}) => <strong className="font-extrabold text-white-500" {...props} />,
                                                                    hr: ({node, ...props}) =>  <hr className="my-2 border-t border-border/50" {...props} />,
                                                                    ul: ({node, ...props}) => <ul className="list-disc ml-4 space-y-1 my-2" {...props} />,
                                                                    a: ({node, ...props}) => (
                                                                        <a 
                                                                            {...props} 
                                                                            target="_blank" 
                                                                            rel="noopener noreferrer"
                                                                            className="text-primary font-medium underline underline-offset-4 hover:text-primary/80 transition-colors cursor-pointer"
                                                                        />
                                                                    ),
                                                                    p: ({node, ...props}) => (
                                                                        <p className="mb-3 last:mb-0 leading-relaxed" {...props} />
                                                                    ),
                                                                }}
                                                            >
                                                                {m.content}
                                                            </ReactMarkdown>
                                                        </div>
                                                    </div>
                                                
                                                    {/* Copy Button */}
                                                    {hoveredMessageIndex === i && (
                                                        <button
                                                            onClick={() => handleCopy(m.content, i)}
                                                            className={`absolute top-1/2 -translate-y-1/2 ${
                                                                m.role === "user" ? "-left-9" : "-right-9"
                                                            } p-1.5 bg-background border border-border rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 active:scale-95`}
                                                            title="Copy message"
                                                        >
                                                            {copiedIndex === i ? (
                                                                <Check size={14} className="text-green-500" />
                                                            ) : (
                                                                <Copy size={14} className="text-muted-foreground" />
                                                            )}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                    
                                    {/* Loading Indicator */}
                                    
                                    {isLoading && (
                                        <div className="flex justify-start animate-in slide-in-from-bottom-2 fade-in duration-300">
                                            <div className="relative bg-gradient-to-br from-muted/80 to-muted border border-border/50 rounded-2xl p-4 shadow-lg backdrop-blur-sm overflow-hidden">
                                                {/* Animated gradient background */}
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer-slow"></div>
                                                
                                                {/* Content */}
                                                <div className="relative z-10 flex items-center gap-3">
                                                    {/* Glowing spinner container */}
                                                    <div className="relative">
                                                        <Loader2 size={18} className="animate-spin text-primary drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.6)]" />
                                                        {/* Pulsing glow ring */}
                                                        <div className="absolute inset-0 animate-ping opacity-20">
                                                            <Loader2 size={18} className="text-primary" />
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Glowing text */}
                                                    <span 
                                                        className={`text-sm font-medium transition-all duration-300 ${
                                                            fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                                                        }`}
                                                        style={{
                                                            background: 'linear-gradient(90deg, hsl(var(--foreground)) 0%, hsl(var(--primary)) 50%, hsl(var(--foreground)) 100%)',
                                                            backgroundSize: '200% auto',
                                                            WebkitBackgroundClip: 'text',
                                                            WebkitTextFillColor: 'transparent',
                                                            backgroundClip: 'text',
                                                            animation: 'glow-pulse 3s ease-in-out infinite'
                                                        }}
                                                    >
                                                        {stepMessages[ragStepIndex]}
                                                    </span>
                                                </div>
                                                
                                                {/* Bottom glow bar */}
                                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent animate-pulse"></div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Scroll to Bottom Button */}
                                    {showScrollButton && (
                                        <button
                                            onClick={scrollToBottom}
                                            className="absolute bottom-5 right-4 w-10 h-10 bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-2xl border border-white/30 text-white rounded-full shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] transition-all duration-300 hover:scale-110 hover:shadow-[0_8px_32px_0_rgba(88,166,255,0.5)] hover:border-primary/50 active:scale-95 z-50 animate-in zoom-in-95 fade-in group overflow-hidden"
                                            title="Scroll to bottom"
                                        >
                                            {/* Animated gradient orb */}
                                            <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
                                            
                                            {/* Shimmer sweep */}
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
                                            
                                            {/* Inner glow */}
                                            <div className="absolute inset-[2px] rounded-full bg-gradient-to-br from-white/10 to-transparent"></div>
                                            
                                            {/* Icon with glow */}
                                            <div className="relative z-10 w-full h-full flex items-center justify-center">
                                                <ChevronDown 
                                                    size={20} 
                                                    className="drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] group-hover:drop-shadow-[0_0_12px_rgba(88,166,255,0.8)] transition-all duration-300" 
                                                />
                                            </div>
                                            
                                            {/* Top highlight */}
                                            <div className="absolute top-0 left-1/4 right-1/4 h-1/3 bg-gradient-to-b from-white/40 to-transparent rounded-full blur-sm"></div>
                                        </button>
                                    )}

                                    {/* Spacer for suggestions */}
                                    {!isLoading && messages.length > 0 && suggestedQuestions.length > 0 && (
                                        <div className="h-24"></div>
                                    )}
                                </div>

                                {showRateLimitError && (
                                    <div className="absolute top-4 left-4 right-4 z-50 animate-in slide-in-from-top-2 fade-in duration-300">
                                        <div className="px-4 py-3 bg-red-500/10 backdrop-blur-xl border border-red-500/30 rounded-xl shadow-lg relative overflow-hidden">
                                            <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-transparent"></div>
                                            
                                            <div className="relative z-10 flex items-start gap-2">
                                                <AlertTriangle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium text-sm text-red-100">Too many requests</div>
                                                    <div className="text-xs text-red-200/80 mt-0.5">Please slow down and try again in a moment</div>
                                                </div>
                                                <button
                                                    onClick={() => setShowRateLimitError(false)}
                                                    className="p-0.5 hover:bg-white/10 rounded transition-all flex-shrink-0"
                                                >
                                                    <X size={14} className="text-red-200" />
                                                </button>
                                            </div>
                                            
                                            {/* Progress bar */}
                                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500/20">
                                                <div className="h-full bg-red-500 animate-shrink-width"></div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Suggested Questions - Sticky at bottom */}
                                {!isLoading && messages.length > 0 && suggestedQuestions.length > 0 && isAtBottom && (
                                    <div className="absolute bottom-0 left-0 right-0 p-4 pt-6 pb-2 bg-gradient-to-t from-background via-background/95 to-transparent pointer-events-none">
                                        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 pointer-events-auto">
                                            {suggestedQuestions.map((question, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => handleSend(question)}
                                                    className="px-3 py-1.5 text-xs bg-muted/50 hover:bg-muted border border-border rounded-full transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-sm whitespace-nowrap flex-shrink-0"
                                                >
                                                    {question}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                {langChainOutput ? (
                                    // Trace view
                                    <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 scrollbar-hide">
                                        <div className="space-y-3">
                                            {/* Header */}
                                            <div className="flex items-center justify-between mb-4">
                                                {/* Wrap the hoverable section in a link */}
                                                <a 
                                                    href={langChainURl || ""}
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="group flex items-center gap-2 px-3 py-2 -ml-3 transition-all duration-300 rounded-full hover:bg-yellow-500/10 cursor-pointer"
                                                >
                                                    <Zap 
                                                        size={16} 
                                                        className="text-yellow-500 transition-transform group-hover:scale-110" 
                                                    />
                                                    <span className="text-sm font-semibold transition-colors group-hover:text-yellow-500">
                                                        Execution Trace
                                                    </span>
                                                    <ExternalLink 
                                                        size={14} 
                                                        className="text-zinc-500 transition-colors group-hover:text-yellow-500" 
                                                    />
                                                </a>

                                                <div className="text-xs text-muted-foreground">
                                                    {langChainOutput?.num_processes} runs • {langChainOutput?.total_time}s
                                                </div>
                                            </div>

                                            {/* Trace Flow */}
                                            <div className="space-y-2">
                                                {/* Query Classification */}
                                                <div className="group">
                                                    <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/5 border border-blue-500/20 hover:border-blue-500/40 transition-all">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5"></div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <span className="text-xs font-medium text-blue-400">Query Classification</span>
                                                                <span className="text-[10px] text-muted-foreground">{langChainOutput?.classification_step_time}s</span>
                                                            </div>
                                                            <div className="text-[11px] text-muted-foreground">Chain → LLM</div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Query Decomposition */}
                                                <div className="ml-4 space-y-2">
                                                    <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-500/5 border border-purple-500/20 hover:border-purple-500/40 transition-all">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5"></div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <span className="text-xs font-medium text-purple-400">Query Decomposition</span>
                                                                <span className="text-[10px] text-muted-foreground">{langChainOutput?.decomposition_step?.total_time}s</span>
                                                            </div>
                                                            <div className="text-[11px] text-muted-foreground">Chain → Prompt → LLM → Parser</div>
                                                        </div>
                                                    </div>

                                                    {/* Sub-queries */}
                                                    <div className="ml-4 space-y-1.5">
                                                        {langChainOutput?.decomposition_step?.queries.map((q: string, idx: number) => (
                                                            <div key={idx} className="flex items-start gap-2 p-2 rounded bg-purple-500/5 border border-purple-500/10">
                                                                <ArrowRight size={12} className="text-purple-400 mt-0.5 flex-shrink-0" />
                                                                <span className="text-[10px] text-muted-foreground">{q}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Step-back Prompting */}
                                                <div className="ml-4">
                                                    <div className="flex items-start gap-3 p-3 rounded-lg bg-green-500/5 border border-green-500/20 hover:border-green-500/40 transition-all">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5"></div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <span className="text-xs font-medium text-green-400">Step-back Prompting</span>
                                                                <span className="text-[10px] text-muted-foreground">{langChainOutput?.step_back_step_time}s</span>
                                                            </div>
                                                            <div className="text-[11px] text-muted-foreground">Chain → LLM</div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Retrieval */}
                                                <div className="space-y-2">
                                                    <div className="flex items-start gap-3 p-3 rounded-lg bg-orange-500/5 border border-orange-500/20 hover:border-orange-500/40 transition-all">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5"></div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <span className="text-xs font-medium text-orange-400">Vector Retrieval</span>
                                                                <span className="text-[10px] text-muted-foreground">{langChainOutput?.vector_retrieval_time}s</span>
                                                            </div>
                                                            <div className="text-[11px] text-muted-foreground">Retriever → Pinecone</div>
                                                            <div className="mt-2 flex items-center gap-2">
                                                                <div className="px-2 py-0.5 rounded bg-orange-500/10 text-[10px] text-orange-400">
                                                                    {retrievalK*2} chunks retrieved
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* LLM Generation */}
                                                <div className="space-y-2">
                                                    <div className="flex items-start gap-3 p-3 rounded-lg bg-pink-500/5 border border-pink-500/20 hover:border-pink-500/40 transition-all">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-pink-500 mt-1.5"></div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <span className="text-xs font-medium text-pink-400">LLM Generation</span>
                                                                <span className="text-[10px] text-muted-foreground">{langChainOutput?.final_generation?.time}s</span>
                                                            </div>
                                                            <div className="text-[11px] text-muted-foreground">Chain → Prompt → LLM</div>
                                                            <div className="mt-2 flex flex-wrap gap-2">
                                                                <div className="px-2 py-0.5 rounded bg-pink-500/10 text-[10px] text-pink-400">
                                                                    {langChainOutput?.final_generation?.tokens} tokens
                                                                </div>
                                                                <div className="px-2 py-0.5 rounded bg-pink-500/10 text-[10px] text-pink-400">
                                                                    ${langChainOutput?.final_generation?.cost}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Summary Stats */}
                                            <div className="mt-4 p-3 rounded-lg bg-card/50 border border-border">
                                                <div className="text-xs font-medium mb-2">Summary</div>
                                                <div className="grid grid-cols-3 gap-3 text-[11px]">
                                                    <div>
                                                        <div className="text-muted-foreground">Total Time</div>
                                                        <div className="font-medium">{langChainOutput?.total_time}s</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-muted-foreground">Total Tokens</div>
                                                        <div className="font-medium">{langChainOutput?.total_tokens}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-muted-foreground">Total Cost</div>
                                                        <div className="font-medium">${langChainOutput?.total_cost.toFixed(5)}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
                                        <div className="text-center max-w-md">
                                            {/* Icon */}
                                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800/50 border border-slate-700 flex items-center justify-center relative overflow-hidden">
                                                <Zap size={28} className="text-slate-600 relative z-10" />
                                                {/* Animated glow effect */}
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-700/20 to-transparent animate-shimmer"></div>
                                            </div>

                                            {/* Title */}
                                            <h3 className="text-lg font-semibold text-slate-300 mb-2">
                                                No Local Trace Available
                                            </h3>

                                            {/* Description */}
                                            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                                                The execution trace for this query hasn't been generated yet. 
                                                Enable auto-fetch traces tracing in settings to view more info.
                                            </p>

                                            {/* Action Buttons */}
                                            <div className="flex flex-col gap-3 items-center">
                                                <button 
                                                    onClick={() => enableTracing && langChainURl ? window.open(langChainURl || "", '_blank', 'noopener,noreferrer') : enableTracing ? setActiveView('chat') : setSettingsView(true)}
                                                    className="px-5 py-2.5 bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 text-slate-200 rounded-lg text-sm font-medium transition-all duration-200 border border-slate-600 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                                                >
                                                    {enableTracing && langChainURl && !loadingTrace ? 'View LangSmith Trace' : enableTracing && loadingTrace ? 'Loading Trace...' : enableTracing ? 'Create Trace' :  'Enable Tracing'}
                                                </button>

                                                <a 
                                                    href="https://docs.smith.langchain.com/tracing" 
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs text-slate-600 hover:text-slate-400 transition-colors flex items-center gap-1.5 group"
                                                >
                                                    <span>Learn about LangSmith tracing</span>
                                                    <ExternalLink size={11} className="group-hover:translate-x-0.5 transition-transform" />
                                                </a>
                                            </div>

                                            {/* Feature highlights */}
                                            <div className="mt-8 pt-6 border-t border-slate-800">
                                                <div className="text-xs text-slate-600 mb-3 font-medium">
                                                    What you'll see with tracing enabled:
                                                </div>
                                                <div className="grid grid-cols-2 gap-3 text-left">
                                                    <div className="flex items-start gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1"></div>
                                                        <div className="text-xs text-slate-500">Query decomposition steps</div>
                                                    </div>
                                                    <div className="flex items-start gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1"></div>
                                                        <div className="text-xs text-slate-500">Vector retrieval details</div>
                                                    </div>
                                                    <div className="flex items-start gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1"></div>
                                                        <div className="text-xs text-slate-500">LLM token usage</div>
                                                    </div>
                                                    <div className="flex items-start gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1"></div>
                                                        <div className="text-xs text-slate-500">Execution timing</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                

                    {/* Slash Command Menu */}
                    {showSlashMenu && filteredCommands.length > 0 && (
                        <div className="absolute bottom-[140px] left-0 right-0 mx-3 mb-2 bg-card border border-border rounded-xl shadow-lg overflow-hidden animate-in slide-in-from-bottom-2 fade-in duration-200 z-50">
                            {filteredCommands.map((cmd, idx) => (
                                <button
                                    key={cmd.id}
                                    onClick={() => selectCommand(cmd)}
                                    className={`w-full px-4 py-2.5 text-left text-sm transition-colors duration-150 ${
                                        idx === selectedCommandIndex
                                        ? "bg-primary/10 text-primary font-medium"
                                        : "hover:bg-muted text-foreground"
                                    }`}
                                >
                                    <div className="font-medium">{cmd.label}</div>
                                    <div className="text-xs text-muted-foreground mt-0.5">{cmd.prompt}</div>
                                </button>
                            ))}
                            <div className="px-4 py-2 bg-muted/50 text-xs text-muted-foreground border-t border-border">
                                Use ↑↓ or Tab to navigate • Enter to select • Esc to close
                            </div>
                        </div>
                    )}

                    {/* Navigation Submenu */}
                    {showNavigationMenu && filteredNavCommands.length > 0 && (
                        <div className="absolute bottom-[140px] left-0 right-0 mx-3 mb-2 bg-card border border-border rounded-xl shadow-lg overflow-hidden fade-in duration-200 z-50">
                            <div className="px-4 py-2 bg-primary/10 border-b border-border">
                                <span className="text-xs font-semibold text-primary">Navigate to section</span>
                            </div>
                            {filteredNavCommands.map((nav, idx) => (
                                <button
                                    key={nav.id}
                                    onClick={() => selectNavigation(nav)}
                                    className={`w-full px-4 py-2.5 text-left text-sm transition-colors duration-150 ${
                                        idx === selectedNavIndex
                                        ? "bg-primary/10 text-primary font-medium"
                                        : "hover:bg-muted text-foreground"
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <div className={`w-1.5 h-1.5 rounded-full ${idx === selectedNavIndex ? 'bg-primary' : 'bg-muted-foreground/30'}`}></div>
                                        <span>{nav.label}</span>
                                    </div>
                                </button>
                            ))}
                            <div className="px-4 py-2 bg-muted/50 text-xs text-muted-foreground border-t border-border">
                                Use ↑↓ or Tab to navigate • Enter to select • Esc to close
                            </div>
                        </div>
                    )}
                    {!settingsView && activeView === 'chat' ? (
                        <>
                            {/* Input Container */}
                            <div className="p-3 pb-1 rounded-b-2xl border-t border-border bg-card/80 backdrop-blur-sm flex-shrink-0">
                                <div className="relative flex items-center">
                                    <input
                                        ref={inputRef}
                                        className="w-full bg-muted rounded-full pl-4 pr-12 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200 placeholder:text-muted-foreground/60 disabled:opacity-50 disabled:cursor-not-allowed"
                                        placeholder={isLoading ? "waiting for response..." : "type a message... (try /)"}
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        disabled={isLoading}
                                    />
                                    
                                    <button
                                        onClick={() => handleSend()}
                                        disabled={!input.trim() || isLoading}
                                        className="absolute right-1.5 p-2 bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-full transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-md hover:shadow-lg flex items-center justify-center"
                                    >
                                        {isLoading ? (
                                            <Loader2 size={16} className="animate-spin" />
                                        ) : (
                                            <Send size={16} />
                                        )}
                                    </button>
                                </div>

                                {/* AI Accuracy Disclaimer */}
                                <p className="mt-1 text-[10px] text-center text-muted-foreground/50 select-none">
                                    Proxy AI can make mistakes. Check important info.
                                </p>
                            </div>
                        </>
                    ) : (
                        <></>
                    )}
                </div>
            )}

            {/* Tooltip/Speech Bubble */}
            

            {/* Tooltip Bubble - Shows when closed */}
            {!isOpen && (
                <div className="absolute bottom-[72px] right-0 mb-2 animate-in slide-in-from-bottom-3 fade-in duration-500">
                    <div className="relative group animate-float">
                        {/* Glass bubble */}
                        <div className="px-4 py-2.5 bg-primary/10 backdrop-blur-xl border border-white/30 text-white rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] whitespace-nowrap relative overflow-hidden">
                            {/* Gradient background layer */}
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-purple-500/20 to-transparent pointer-events-none"></div>
                            
                            {/* Content */}
                            <span className="text-sm font-medium relative z-10 drop-shadow-lg">
                                Ask me about my projects!
                            </span>

                            {/* Animated gradient orb */}
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
                            
                            {/* Shimmer sweep */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>                    
                            
                            {/* Shimmer effect on hover */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shimmer pointer-events-none"></div>
                            
                        </div>

                        {/* Glass arrow */}
                        <div className="absolute -bottom-2 right-6 w-4 h-4 bg-primary/10 backdrop-blur-xl border-r border-b border-white/30 transform rotate-45 shadow-lg">
                            {/* Arrow gradient */}
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-transparent"></div>
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-14 h-14 bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-full flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 hover:shadow-2xl ring-4 ring-primary/20"
            >
                <div className={`transition-transform duration-300 ${isOpen ? "rotate-90" : "rotate-0"}`}>
                {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
                </div>
            </button>

            {/* Notification Dot (optional - shows when closed and has messages) */}
            {!isOpen && messages.length > 1 && (
                <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-background animate-pulse"></div>
            )}
        </div>
    );
}