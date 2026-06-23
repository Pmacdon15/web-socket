"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { getSocket } from "@/lib/socket";

// Interfaces
interface User {
  id: string;
  name: string;
  avatar: string;
}

interface Friend {
  id: string;
  name: string;
  avatar: string;
  online: boolean;
  isBot?: boolean;
}

interface Group {
  id: string;
  name: string;
  members: string[];
}

interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: string;
  roomId: string;
}

const ADJECTIVES = ["Quantum", "Neon", "Cyber", "Retro", "Alpha", "Shadow", "Solar", "Glitch", "Sonic", "Vortex", "Pixel", "Aero", "Hyper"];
const NOUNS = ["Phoenix", "Falcon", "Ghost", "Ranger", "Matrix", "Knight", "Hacker", "Rebel", "Stalker", "Nomad", "Coyote", "Panda", "Sphinx"];
const BOT_AVATARS = [
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=60", // EchoBot
  "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=100&auto=format&fit=crop&q=60", // AlphaAI
  "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=100&auto=format&fit=crop&q=60"  // NovaCoder
];

export default function Dashboard() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [activeChat, setActiveChat] = useState<{ type: "friend" | "group"; id: string; name: string } | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  
  // UI State
  const [messageInput, setMessageInput] = useState("");
  const [addFriendId, setAddFriendId] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");
  
  // Typing indicators
  const [typingUsers, setTypingUsers] = useState<Record<string, string[]>>({}); // roomId -> array of userNames
  const [socketConnected, setSocketConnected] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const socketRef = useRef<any>(null);

  // Initialize Socket.IO and User Session
  useEffect(() => {
    // 1. Initialize user details
    let storedUser = localStorage.getItem("voltchat_user");
    let userObj: User;
    if (storedUser) {
      userObj = JSON.parse(storedUser);
    } else {
      const randAdj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
      const randNoun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
      const randId = Math.random().toString(36).substring(2, 9).toUpperCase();
      userObj = {
        id: `USR-${randId}`,
        name: `${randAdj} ${randNoun} #${Math.floor(1000 + Math.random() * 9000)}`,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${randId}`
      };
      localStorage.setItem("voltchat_user", JSON.stringify(userObj));
    }
    setCurrentUser(userObj);
    setEditedName(userObj.name);

    // 2. Initialize default bot friends
    const defaultBots: Friend[] = [
      { id: "bot-echo", name: "EchoBot 🤖", avatar: BOT_AVATARS[0], online: true, isBot: true },
      { id: "bot-ai", name: "AlphaAI 🧠", avatar: BOT_AVATARS[1], online: true, isBot: true },
      { id: "bot-coder", name: "NovaCoder 💻", avatar: BOT_AVATARS[2], online: true, isBot: true }
    ];

    // 3. Load saved friends & groups
    const savedFriends = localStorage.getItem("voltchat_friends");
    if (savedFriends) {
      setFriends(JSON.parse(savedFriends));
    } else {
      setFriends(defaultBots);
      localStorage.setItem("voltchat_friends", JSON.stringify(defaultBots));
    }

    const savedGroups = localStorage.getItem("voltchat_groups");
    if (savedGroups) {
      setGroups(JSON.parse(savedGroups));
    } else {
      const initialGroups = [{ id: "global-lounge", name: "Global Lounge 🌐", members: ["all"] }];
      setGroups(initialGroups);
      localStorage.setItem("voltchat_groups", JSON.stringify(initialGroups));
    }

    const savedMessages = localStorage.getItem("voltchat_messages");
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }

    // 4. Connect to Socket.IO Server
    const socket = getSocket();
    socketRef.current = socket;

    socket.on("connect", () => {
      setSocketConnected(true);
      // Join global lounge by default
      socket.emit("join-room", "global-lounge");
    });

    socket.on("disconnect", () => {
      setSocketConnected(false);
    });

    // Handle incoming messages
    socket.on("message", (msg: Message) => {
      setMessages((prev) => {
        const updated = {
          ...prev,
          [msg.roomId]: [...(prev[msg.roomId] || []), msg]
        };
        localStorage.setItem("voltchat_messages", JSON.stringify(updated));
        return updated;
      });
    });

    // Handle typing events
    socket.on("user-typing", (data: { userId: string; userName: string; isTyping: boolean }) => {
      if (!activeChat) return;
      const currentRoomId = getRoomId(activeChat);
      setTypingUsers((prev) => {
        const list = prev[currentRoomId] || [];
        if (data.isTyping) {
          if (!list.includes(data.userName)) {
            return { ...prev, [currentRoomId]: [...list, data.userName] };
          }
        } else {
          return { ...prev, [currentRoomId]: list.filter((name) => name !== data.userName) };
        }
        return prev;
      });
    });

    return () => {
      socket.off("message");
      socket.off("user-typing");
    };
  }, [activeChat]);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeChat, typingUsers]);

  // Compute Room ID based on active chat
  const getRoomId = (chat: { type: "friend" | "group"; id: string }) => {
    if (!currentUser) return "";
    if (chat.type === "group") {
      return chat.id;
    } else {
      // Sort IDs alphabetically to make room identifier unique between two users
      const ids = [currentUser.id, chat.id].sort();
      return `dm-${ids[0]}-${ids[1]}`;
    }
  };

  // Join the correct room on room selection change
  const handleSelectChat = (chat: { type: "friend" | "group"; id: string; name: string }) => {
    if (activeChat && socketRef.current) {
      socketRef.current.emit("leave-room", getRoomId(activeChat));
    }
    setActiveChat(chat);
    if (socketRef.current) {
      socketRef.current.emit("join-room", getRoomId({ type: chat.type, id: chat.id }));
    }
  };

  // Send Message
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageInput.trim() || !currentUser || !activeChat) return;

    const roomId = getRoomId(activeChat);
    const messagePayload: Message = {
      id: `MSG-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      text: messageInput.trim(),
      senderId: currentUser.id,
      senderName: currentUser.name,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      roomId: roomId
    };

    // Emit message to Socket.IO server
    if (socketRef.current && socketConnected) {
      socketRef.current.emit("send-message", { roomId, message: messagePayload });
    } else {
      // Fallback/offline message append
      setMessages((prev) => {
        const updated = {
          ...prev,
          [roomId]: [...(prev[roomId] || []), messagePayload]
        };
        localStorage.setItem("voltchat_messages", JSON.stringify(updated));
        return updated;
      });
    }

    setMessageInput("");

    // Emit stopped typing
    if (socketRef.current) {
      socketRef.current.emit("typing", { roomId, userId: currentUser.id, userName: currentUser.name, isTyping: false });
    }

    // Bot Auto-Response logic for offline simulation
    if (activeChat.type === "friend" && activeChat.id.startsWith("bot-")) {
      handleBotResponse(activeChat.id, messagePayload.text, roomId);
    }
  };

  // Typing logic
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);
    if (!currentUser || !activeChat || !socketRef.current) return;

    const roomId = getRoomId(activeChat);
    socketRef.current.emit("typing", { roomId, userId: currentUser.id, userName: currentUser.name, isTyping: true });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current.emit("typing", { roomId, userId: currentUser.id, userName: currentUser.name, isTyping: false });
    }, 1500);
  };

  // Bot response generator
  const handleBotResponse = (botId: string, userText: string, roomId: string) => {
    let botReply = "";
    let botName = "";
    let botAvatar = "";

    if (botId === "bot-echo") {
      botName = "EchoBot 🤖";
      botAvatar = BOT_AVATARS[0];
      botReply = `ECHO PROTOCOL ACTIVATED: "${userText}"`;
    } else if (botId === "bot-ai") {
      botName = "AlphaAI 🧠";
      botAvatar = BOT_AVATARS[1];
      const responses = [
        "Fascinating perspective. The alignment of human communication with real-time socket events represents standard system cohesion.",
        "System Analysis: CPU and Memory nodes are performing with 99.8% stability under Vercel's Fluid compute.",
        "Deep thought: If serverless functions are ephemeral, does a message truly exist if no client is connected to receive it?",
        "I am processing your words. Keep in mind: Socket.IO establishes a bi-directional event stream over raw TCP connections."
      ];
      botReply = responses[Math.floor(Math.random() * responses.length)];
    } else if (botId === "bot-coder") {
      botName = "NovaCoder 💻";
      botAvatar = BOT_AVATARS[2];
      const jokes = [
        "Why do programmers prefer dark mode? Because light attracts bugs! 🐛",
        "There are 10 types of people in this world: Those who understand binary, and those who don't. 💾",
        "How do you get rich in coding? You declare your variables 'private' so no one can access your balance! 💰",
        "A SQL query walks into a bar, walks up to two tables and asks, 'Can I join you?' 📊"
      ];
      botReply = jokes[Math.floor(Math.random() * jokes.length)];
    }

    // Set bot typing state locally
    setTimeout(() => {
      setTypingUsers((prev) => ({
        ...prev,
        [roomId]: [botName]
      }));
    }, 400);

    setTimeout(() => {
      // Clear bot typing state
      setTypingUsers((prev) => ({
        ...prev,
        [roomId]: (prev[roomId] || []).filter((name) => name !== botName)
      }));

      // Append bot message
      const botPayload: Message = {
        id: `MSG-BOT-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
        text: botReply,
        senderId: botId,
        senderName: botName,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        roomId: roomId
      };

      setMessages((prev) => {
        const updated = {
          ...prev,
          [roomId]: [...(prev[roomId] || []), botPayload]
        };
        localStorage.setItem("voltchat_messages", JSON.stringify(updated));
        return updated;
      });
    }, 1500);
  };

  // Add Friend Manual Functionality
  const handleAddFriend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addFriendId.trim() || !currentUser) return;
    if (addFriendId.trim() === currentUser.id) {
      alert("You cannot add yourself as a friend.");
      return;
    }
    if (friends.some((f) => f.id === addFriendId.trim())) {
      alert("This user is already your friend!");
      return;
    }

    const randAdj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const randNoun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    
    // Check if adding another active session or generate random mock details
    let friendName = `${randAdj} ${randNoun}`;
    if (addFriendId.trim().startsWith("USR-")) {
      // If it looks like a real session ID, we'll keep the name format
      friendName = `Peer ${randAdj}`;
    }

    const newFriend: Friend = {
      id: addFriendId.trim(),
      name: friendName,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${addFriendId.trim()}`,
      online: true
    };

    const updatedFriends = [...friends, newFriend];
    setFriends(updatedFriends);
    localStorage.setItem("voltchat_friends", JSON.stringify(updatedFriends));
    setAddFriendId("");
    setShowAddFriend(false);
    
    // Auto open conversation with new friend
    handleSelectChat({ type: "friend", id: newFriend.id, name: newFriend.name });
  };

  // Create Group Functionality
  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim() || !currentUser) return;

    const newGroup: Group = {
      id: `GRP-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      name: newGroupName.trim(),
      members: [currentUser.id]
    };

    const updatedGroups = [...groups, newGroup];
    setGroups(updatedGroups);
    localStorage.setItem("voltchat_groups", JSON.stringify(updatedGroups));
    setNewGroupName("");
    setShowCreateGroup(false);

    // Auto open conversation in group
    handleSelectChat({ type: "group", id: newGroup.id, name: newGroup.name });
  };

  // Edit Username Functionality
  const handleUpdateName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editedName.trim() || !currentUser) return;
    const updatedUser = { ...currentUser, name: editedName.trim() };
    setCurrentUser(updatedUser);
    localStorage.setItem("voltchat_user", JSON.stringify(updatedUser));
    setIsEditingName(false);
  };

  const copyUserId = () => {
    if (!currentUser) return;
    navigator.clipboard.writeText(currentUser.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 overflow-hidden font-sans relative">
      
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-fuchsia-600/5 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Main Sidebar */}
      <aside className="w-80 border-r border-zinc-900 bg-zinc-950 flex flex-col z-10 shrink-0">
        
        {/* Sidebar Header / VoltChat Logo & Connection status */}
        <div className="p-4 border-b border-zinc-900 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-85 transition-opacity">
            <span className="w-6 h-6 rounded-lg bg-violet-600 flex items-center justify-center font-bold text-sm text-white">V</span>
            <span className="font-extrabold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-fuchsia-400">VoltChat</span>
          </Link>
          <div className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${socketConnected ? "bg-emerald-500 active-glow" : "bg-rose-500"}`}></span>
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
              {socketConnected ? "connected" : "offline"}
            </span>
          </div>
        </div>

        {/* User Card Area */}
        {currentUser && (
          <div className="p-4 border-b border-zinc-900 bg-zinc-900/10 flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <img
                src={currentUser.avatar}
                alt="Avatar"
                className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 p-1 object-cover"
              />
              <div className="flex-1 min-w-0">
                {isEditingName ? (
                  <form onSubmit={handleUpdateName} className="flex gap-1.5 items-center">
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="w-full text-xs font-semibold px-2 py-1 bg-zinc-950 rounded border border-zinc-800 text-zinc-200 outline-none focus:border-violet-500"
                      autoFocus
                    />
                    <button type="submit" className="p-1 rounded bg-violet-600 hover:bg-violet-500 text-white text-[10px]">
                      ✓
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingName(false);
                        setEditedName(currentUser.name);
                      }}
                      className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-[10px]"
                    >
                      ✕
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center gap-1">
                    <h4 className="font-bold text-sm text-zinc-200 truncate">{currentUser.name}</h4>
                    <button
                      onClick={() => setIsEditingName(true)}
                      className="text-zinc-500 hover:text-zinc-300 p-0.5"
                      title="Edit display name"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </div>
                )}
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] font-mono text-zinc-500 tracking-tight">{currentUser.id}</span>
                  <button
                    onClick={copyUserId}
                    className="text-[9px] font-semibold text-violet-400 hover:text-violet-300 transition-colors uppercase tracking-wider"
                  >
                    {copiedId ? "copied!" : "copy"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Channels / Scrollable list */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-6">
          
          {/* Friends Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-2">
              <span className="text-xs uppercase font-extrabold text-zinc-500 tracking-wider">Friends</span>
              <button
                onClick={() => setShowAddFriend(true)}
                className="p-1 rounded hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 transition-colors"
                title="Add Friend"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </button>
            </div>
            <div className="space-y-0.5">
              {friends.map((friend) => {
                const active = activeChat?.type === "friend" && activeChat.id === friend.id;
                return (
                  <button
                    key={friend.id}
                    onClick={() => handleSelectChat({ type: "friend", id: friend.id, name: friend.name })}
                    className={`w-full flex items-center gap-3 px-2 py-2 rounded-xl text-left transition-all duration-200 ${
                      active ? "bg-violet-600/15 border border-violet-500/25 text-violet-300" : "hover:bg-zinc-900/50 border border-transparent text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <div className="relative">
                      <img src={friend.avatar} alt={friend.name} className="w-8 h-8 rounded-lg bg-zinc-900 p-0.5 object-cover" />
                      <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-zinc-950 ${friend.online ? "bg-emerald-500" : "bg-zinc-600"}`}></span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{friend.name}</p>
                      <p className="text-[10px] text-zinc-500 font-mono truncate">{friend.id}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Groups Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-2">
              <span className="text-xs uppercase font-extrabold text-zinc-500 tracking-wider">Groups</span>
              <button
                onClick={() => setShowCreateGroup(true)}
                className="p-1 rounded hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 transition-colors"
                title="Create Group"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </button>
            </div>
            <div className="space-y-0.5">
              {groups.map((group) => {
                const active = activeChat?.type === "group" && activeChat.id === group.id;
                return (
                  <button
                    key={group.id}
                    onClick={() => handleSelectChat({ type: "group", id: group.id, name: group.name })}
                    className={`w-full flex items-center gap-3 px-2 py-2 rounded-xl text-left transition-all duration-200 ${
                      active ? "bg-violet-600/15 border border-violet-500/25 text-violet-300" : "hover:bg-zinc-900/50 border border-transparent text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center border border-zinc-800 text-xs font-bold text-violet-400">
                      #
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{group.name}</p>
                      <p className="text-[10px] text-zinc-500 font-mono truncate">{group.id}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Chat Interface */}
      <main className="flex-1 flex flex-col bg-zinc-950 z-10 relative">
        {activeChat ? (
          <>
            {/* Chat Room Header */}
            <header className="h-16 border-b border-zinc-900 flex items-center justify-between px-6 bg-zinc-950/60 backdrop-blur-md">
              <div className="flex items-center gap-3">
                {activeChat.type === "friend" ? (
                  <img
                    src={friends.find((f) => f.id === activeChat.id)?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${activeChat.id}`}
                    alt={activeChat.name}
                    className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 p-0.5 object-cover"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-lg bg-zinc-900 flex items-center justify-center border border-zinc-800 text-sm font-bold text-violet-400">
                    #
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-bold text-zinc-200">{activeChat.name}</h3>
                  <p className="text-[10px] text-zinc-500 font-mono tracking-tight">{activeChat.id}</p>
                </div>
              </div>
              
              {/* Optional Room Actions */}
              <div className="flex items-center gap-2">
                {activeChat.type === "friend" && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold tracking-wide">
                    Direct Message
                  </span>
                )}
                {activeChat.type === "group" && (
                  <span className="px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[10px] font-semibold tracking-wide">
                    Group Channel
                  </span>
                )}
              </div>
            </header>

            {/* Chat Thread */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
              {/* Info Alert on Websockets */}
              <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/20 text-xs text-zinc-400 leading-relaxed max-w-2xl mx-auto flex items-start gap-3">
                <span className="text-violet-400 shrink-0 text-base mt-0.5">ℹ</span>
                <p>
                  This chat room uses a Socket.IO connection. If you copy your User ID and paste it in another browser window (or incognito tab), you can chat in real-time between tabs!
                </p>
              </div>

              {/* Message List */}
              {(messages[getRoomId(activeChat)] || []).length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-zinc-600 gap-2">
                  <svg className="w-8 h-8 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p className="text-xs">No messages yet. Send a message to start the conversation!</p>
                </div>
              ) : (
                (messages[getRoomId(activeChat)] || []).map((msg) => {
                  const isSelf = msg.senderId === currentUser?.id;
                  return (
                    <div key={msg.id} className={`flex flex-col max-w-[70%] ${isSelf ? "ml-auto items-end" : "mr-auto items-start"}`}>
                      {/* Name of sender */}
                      <span className="text-[10px] text-zinc-500 font-semibold mb-1 ml-1 mr-1">
                        {isSelf ? "You" : msg.senderName}
                      </span>
                      
                      {/* Message bubble */}
                      <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        isSelf ? "bg-violet-600 text-white rounded-tr-none" : "bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-tl-none"
                      }`}>
                        {msg.text}
                      </div>

                      {/* Time */}
                      <span className="text-[9px] text-zinc-600 mt-1 ml-1 mr-1 font-mono">
                        {msg.timestamp}
                      </span>
                    </div>
                  );
                })
              )}

              {/* Bot or User Typing status */}
              {typingUsers[getRoomId(activeChat)] && typingUsers[getRoomId(activeChat)].length > 0 && (
                <div className="flex items-center gap-2 text-xs text-zinc-500 italic mt-2 ml-1">
                  <span className="flex gap-0.5">
                    <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></span>
                    <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></span>
                  </span>
                  <span>{typingUsers[getRoomId(activeChat)].join(", ")} {typingUsers[getRoomId(activeChat)].length === 1 ? "is" : "are"} typing...</span>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input Area */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-zinc-900 bg-zinc-950 flex gap-3 items-center">
              <input
                type="text"
                value={messageInput}
                onChange={handleInputChange}
                placeholder={`Type a message to ${activeChat.name}...`}
                className="flex-1 glass-input px-4 py-3 rounded-xl text-sm text-zinc-200 outline-none"
              />
              <button
                type="submit"
                className="px-5 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 font-semibold text-sm transition-all duration-200 shadow-md shadow-violet-500/10 shrink-0"
              >
                Send
              </button>
            </form>
          </>
        ) : (
          /* Welcome Screen when no chat selected */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-xl mx-auto gap-6">
            <div className="w-20 h-20 rounded-3xl bg-violet-500/10 flex items-center justify-center text-violet-400 border border-violet-500/20 animate-float">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-zinc-100 bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-fuchsia-400">Welcome to VoltChat Dashboard</h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Connect and exchange real-time messages instantly. Choose a group lounge, chat with one of the built-in bot companions, or add a friend using their user ID.
              </p>
            </div>

            {/* Quick Testing Instructions Card */}
            <div className="glass-panel p-5 rounded-2xl w-full text-left space-y-3 mt-2 border-violet-500/10">
              <h4 className="text-xs font-bold uppercase tracking-wider text-violet-400">🚀 Quick Real-Time Test</h4>
              <ol className="text-xs text-zinc-400 space-y-2 list-decimal list-inside leading-relaxed">
                <li>Copy your ID from the sidebar bottom left.</li>
                <li>Open a new browser window in <strong>Incognito Mode</strong> and load this app dashboard.</li>
                <li>On the new tab, click the <b>Friend Add Icon (+)</b> next to Friends.</li>
                <li>Paste your original ID, click add, and select the newly added peer.</li>
                <li>Exchange messages! Watch them transfer in real-time using Socket.IO.</li>
              </ol>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => handleSelectChat({ type: "group", id: "global-lounge", name: "Global Lounge 🌐" })}
                className="px-6 py-2.5 rounded-xl bg-violet-600/10 border border-violet-500/20 text-violet-400 hover:bg-violet-600 hover:text-white font-semibold text-xs transition-all duration-200"
              >
                Join Global Lounge
              </button>
              <button
                onClick={() => handleSelectChat({ type: "friend", id: "bot-echo", name: "EchoBot 🤖" })}
                className="px-6 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 font-semibold text-xs transition-all duration-200"
              >
                Chat with EchoBot
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Add Friend Modal Popup */}
      {showAddFriend && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel max-w-sm w-full p-6 rounded-2xl border border-zinc-800 relative space-y-4">
            <button
              onClick={() => setShowAddFriend(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300"
            >
              ✕
            </button>
            <h3 className="text-lg font-bold text-zinc-100">Add Friend</h3>
            <p className="text-xs text-zinc-400">
              Type in a user ID to add a peer to your friends directory. You can copy the ID of another tab to connect.
            </p>
            <form onSubmit={handleAddFriend} className="space-y-4">
              <input
                type="text"
                value={addFriendId}
                onChange={(e) => setAddFriendId(e.target.value)}
                placeholder="e.g. USR-ABCD123"
                className="w-full glass-input px-4 py-2.5 rounded-xl text-sm outline-none"
                required
                autoFocus
              />
              <div className="flex gap-3 justify-end text-xs">
                <button
                  type="button"
                  onClick={() => setShowAddFriend(false)}
                  className="px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 font-semibold text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 font-semibold text-white"
                >
                  Add Friend
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Group Modal Popup */}
      {showCreateGroup && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel max-w-sm w-full p-6 rounded-2xl border border-zinc-800 relative space-y-4">
            <button
              onClick={() => setShowCreateGroup(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300"
            >
              ✕
            </button>
            <h3 className="text-lg font-bold text-zinc-100">Create Group Channel</h3>
            <p className="text-xs text-zinc-400">
              Create a new room where multiple users can join and share chat messages.
            </p>
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="e.g. Design Sync 🎨"
                className="w-full glass-input px-4 py-2.5 rounded-xl text-sm outline-none"
                required
                autoFocus
              />
              <div className="flex gap-3 justify-end text-xs">
                <button
                  type="button"
                  onClick={() => setShowCreateGroup(false)}
                  className="px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 font-semibold text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 font-semibold text-white"
                >
                  Create Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
