import { Feather } from "@expo/vector-icons";
import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import * as Speech from "expo-speech";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface Conversation {
  id: number;
  title: string;
  createdAt: string;
}

const QUICK_PROMPTS = [
  { icon: "trending-up" as const, label: "Monthly summary", prompt: "Give me a detailed monthly spending summary and key insights." },
  { icon: "alert-triangle" as const, label: "Overspending", prompt: "Where am I overspending compared to healthy budget norms?" },
  { icon: "target" as const, label: "Save more", prompt: "Based on my income and expenses, how can I save more this month?" },
  { icon: "bar-chart-2" as const, label: "Budget plan", prompt: "Create a smart monthly budget plan for me using the 50/30/20 rule for India." },
];

function TypingDots({ color }: { color: string }) {
  return (
    <View style={{ flexDirection: "row", gap: 4, paddingVertical: 4 }}>
      {[0, 1, 2].map((i) => (
        <View
          key={i}
          style={{
            width: 7,
            height: 7,
            borderRadius: 4,
            backgroundColor: color,
            opacity: 0.6,
          }}
        />
      ))}
    </View>
  );
}

export default function AdvisorScreen() {
  const colors = useColors();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [streamBuffer, setStreamBuffer] = useState("");
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const flatListRef = useRef<FlatList>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, streamBuffer, scrollToBottom]);

  const loadConversations = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/openai/conversations`);
      const data: Conversation[] = await res.json();
      setConversations(data);
    } catch {}
  };

  const loadConversation = async (id: number) => {
    try {
      const res = await fetch(`${BASE_URL}/api/openai/conversations/${id}/messages`);
      const data = await res.json();
      setMessages(data.map((m: { id: number; role: string; content: string }) => ({
        id: String(m.id),
        role: m.role as "user" | "assistant",
        content: m.content,
      })));
      setConversationId(id);
      setShowHistory(false);
    } catch {}
  };

  const createNewConversation = async (firstMessage: string) => {
    const title = firstMessage.slice(0, 40) + (firstMessage.length > 40 ? "…" : "");
    const res = await fetch(`${BASE_URL}/api/openai/conversations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    const data: Conversation = await res.json();
    setConversations((prev) => [data, ...prev]);
    return data.id;
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || streaming) return;
    setInput("");
    Speech.stop();

    let cid = conversationId;
    if (!cid) {
      cid = await createNewConversation(content);
      setConversationId(cid);
    }

    const userMsg: ChatMessage = { id: Date.now().toString(), role: "user", content };
    setMessages((prev) => [...prev, userMsg]);
    setStreaming(true);
    setStreamBuffer("");

    try {
      const res = await fetch(`${BASE_URL}/api/openai/conversations/${cid}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const parts = buf.split("\n\n");
        buf = parts.pop() ?? "";
        for (const part of parts) {
          if (!part.startsWith("data: ")) continue;
          try {
            const json = JSON.parse(part.slice(6));
            if (json.content) {
              fullText += json.content;
              setStreamBuffer(fullText);
            }
              if (json.done) {
                setMessages((prev) => [
                  ...prev,
                  { id: Date.now().toString() + "a", role: "assistant", content: fullText },
                ]);
                setStreamBuffer("");
                if (voiceEnabled) {
                  Speech.speak(fullText.replace(/[*#]/g, ''), { rate: 1.0 });
                }
              }
            } catch {}
          }
        }
      } catch {
        setMessages((prev) => [
          ...prev,
          { id: Date.now().toString() + "e", role: "assistant", content: "Sorry, something went wrong. Please try again." },
        ]);
        setStreamBuffer("");
      } finally {
        setStreaming(false);
      }
    };

  const allMessages: ChatMessage[] = [
    ...messages,
    ...(streaming
      ? [{ id: "streaming", role: "assistant" as const, content: streamBuffer }]
      : []),
  ];

  if (showHistory) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.historyHeader, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => setShowHistory(false)} style={styles.backBtn}>
            <Feather name="arrow-left" size={20} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.historyTitle, { color: colors.foreground }]}>Chat History</Text>
          <TouchableOpacity
            onPress={() => {
              setConversationId(null);
              setMessages([]);
              setShowHistory(false);
            }}
            style={[styles.newChatBtn, { backgroundColor: colors.primary }]}
          >
            <Feather name="plus" size={14} color="#fff" />
            <Text style={styles.newChatBtnText}>New</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 8 }}>
          {conversations.length === 0 && (
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No conversations yet.</Text>
          )}
          {conversations.map((c) => (
            <TouchableOpacity
              key={c.id}
              onPress={() => loadConversation(c.id)}
              style={[styles.convoItem, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <Feather name="message-square" size={16} color={colors.mutedForeground} style={{ marginTop: 1 }} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.convoTitle, { color: colors.foreground }]} numberOfLines={1}>{c.title}</Text>
                <Text style={[styles.convoDate, { color: colors.mutedForeground }]}>
                  {new Date(c.createdAt).toLocaleDateString("en-IN")}
                </Text>
              </View>
              <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.card }]}>
        <View style={styles.headerLeft}>
          <View style={[styles.avatarSmall, { backgroundColor: colors.primary }]}>
            <Feather name="zap" size={14} color="#fff" />
          </View>
          <View>
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>SAVEONY AI</Text>
            <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>Financial Advisor</Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <TouchableOpacity
            onPress={() => {
              if (voiceEnabled) Speech.stop();
              setVoiceEnabled(!voiceEnabled);
            }}
            style={[styles.historyBtn, { borderColor: colors.border }]}
          >
            <Feather name={voiceEnabled ? "volume-2" : "volume-x"} size={16} color={voiceEnabled ? colors.primary : colors.mutedForeground} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => { loadConversations(); setShowHistory(true); }}
            style={[styles.historyBtn, { borderColor: colors.border }]}
          >
            <Feather name="clock" size={15} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={allMessages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.messageList,
            allMessages.length === 0 && styles.messageListEmpty,
          ]}
          onContentSizeChange={scrollToBottom}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={[styles.bigAvatar, { backgroundColor: colors.primary }]}>
                <Feather name="zap" size={32} color="#fff" />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                Your AI Financial Advisor
              </Text>
              <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>
                Ask me anything about your finances — spending, savings, budgets, and investments.
              </Text>
              <View style={styles.quickGrid}>
                {QUICK_PROMPTS.map((q) => (
                  <TouchableOpacity
                    key={q.label}
                    onPress={() => sendMessage(q.prompt)}
                    style={[styles.quickCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                  >
                    <View style={[styles.quickIcon, { backgroundColor: colors.primary + "20" }]}>
                      <Feather name={q.icon} size={16} color={colors.primary} />
                    </View>
                    <Text style={[styles.quickLabel, { color: colors.foreground }]}>{q.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          }
          renderItem={({ item }) => (
            <View
              style={[
                styles.messageRow,
                item.role === "user" ? styles.messageRowRight : styles.messageRowLeft,
              ]}
            >
              {item.role === "assistant" && (
                <View style={[styles.assistantAvatar, { backgroundColor: colors.primary }]}>
                  <Feather name="zap" size={10} color="#fff" />
                </View>
              )}
              <View
                style={[
                  styles.bubble,
                  item.role === "user"
                    ? [styles.userBubble, { backgroundColor: colors.primary }]
                    : [styles.aiBubble, { backgroundColor: colors.card, borderColor: colors.border }],
                ]}
              >
                {item.role === "assistant" && item.id === "streaming" && !item.content ? (
                  <TypingDots color={colors.primary} />
                ) : (
                  <Text
                    style={[
                      styles.bubbleText,
                      { color: item.role === "user" ? "#fff" : colors.foreground },
                    ]}
                  >
                    {item.content}
                  </Text>
                )}
              </View>
            </View>
          )}
        />

        {/* Input */}
        <View style={[styles.inputRow, { borderTopColor: colors.border, backgroundColor: colors.card }]}>
          <TextInput
            style={[styles.textInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
            value={input}
            onChangeText={setInput}
            placeholder="Ask about your finances…"
            placeholderTextColor={colors.mutedForeground}
            multiline
            maxLength={2000}
            editable={!streaming}
            onSubmitEditing={() => sendMessage(input)}
            returnKeyType="send"
          />
          <TouchableOpacity
            onPress={() => sendMessage(input)}
            disabled={!input.trim() || streaming}
            style={[
              styles.sendBtn,
              { backgroundColor: input.trim() && !streaming ? colors.primary : colors.muted },
            ]}
          >
            {streaming ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Feather name="send" size={16} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatarSmall: {
    width: 32, height: 32, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
  },
  headerTitle: { fontSize: 14, fontWeight: "700" },
  headerSub: { fontSize: 11, marginTop: 1 },
  historyBtn: {
    width: 36, height: 36, borderRadius: 10, borderWidth: 1,
    alignItems: "center", justifyContent: "center",
  },
  historyHeader: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1,
  },
  backBtn: { padding: 4 },
  historyTitle: { flex: 1, fontSize: 16, fontWeight: "700" },
  newChatBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10,
  },
  newChatBtnText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  emptyText: { textAlign: "center", marginTop: 40, fontSize: 14 },
  convoItem: {
    flexDirection: "row", alignItems: "center", gap: 12,
    padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 8,
  },
  convoTitle: { fontSize: 13, fontWeight: "600" },
  convoDate: { fontSize: 11, marginTop: 2 },
  messageList: { padding: 16, gap: 12, flexGrow: 1 },
  messageListEmpty: { flex: 1, justifyContent: "center" },
  emptyState: { alignItems: "center", padding: 24 },
  bigAvatar: {
    width: 64, height: 64, borderRadius: 20,
    alignItems: "center", justifyContent: "center", marginBottom: 16,
  },
  emptyTitle: { fontSize: 18, fontWeight: "700", textAlign: "center", marginBottom: 8 },
  emptyDesc: { fontSize: 13, textAlign: "center", lineHeight: 20, marginBottom: 24, maxWidth: 280 },
  quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "center" },
  quickCard: {
    width: 140, padding: 14, borderRadius: 16, borderWidth: 1,
    alignItems: "center", gap: 8,
  },
  quickIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  quickLabel: { fontSize: 12, fontWeight: "600", textAlign: "center" },
  messageRow: { flexDirection: "row", alignItems: "flex-end", gap: 8 },
  messageRowRight: { justifyContent: "flex-end" },
  messageRowLeft: { justifyContent: "flex-start" },
  assistantAvatar: {
    width: 24, height: 24, borderRadius: 8,
    alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  bubble: { maxWidth: "80%", borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  userBubble: { borderBottomRightRadius: 4 },
  aiBubble: { borderBottomLeftRadius: 4, borderWidth: 1 },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  inputRow: {
    flexDirection: "row", alignItems: "flex-end", gap: 10,
    paddingHorizontal: 12, paddingVertical: 10, borderTopWidth: 1,
  },
  textInput: {
    flex: 1, borderWidth: 1, borderRadius: 16,
    paddingHorizontal: 14, paddingVertical: 10,
    fontSize: 14, maxHeight: 120, minHeight: 44,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 14,
    alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
});
