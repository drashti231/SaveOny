import React, { useState, useRef } from "react";
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  TextInput, KeyboardAvoidingView, Platform, FlatList
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

interface Message {
  id: string;
  role: "assistant" | "user";
  text: string;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: "0",
    role: "assistant",
    text: "Hi there! 👋 I'm your AI financial assistant. Ask me anything about your spending, budgets, or savings goals.",
  },
];

const SUGGESTIONS = [
  "How much did I spend this month?",
  "How can I save more money?",
  "What's my biggest expense category?",
  "Am I on track with my savings goal?",
];

const AUTO_REPLIES: Record<string, string> = {
  "spend": "You've spent ₹17,420 this month — that's 70% of your ₹25,000 budget. Food & Dining (₹8,000) and Shopping (₹5,000) are your top categories.",
  "save": "You're currently saving ₹24,580/month! To save more, try reducing your Food & Dining budget by 20% which could add ₹1,600 to your savings.",
  "expense": "Your biggest expense category is Food & Dining (₹8,000 / 46% of total), followed by Shopping (₹5,000 / 29%) and Transport (₹3,000 / 17%).",
  "goal": "Great news! You're 65% of the way to your Emergency Fund goal (₹32,500 of ₹50,000). At your current rate, you'll hit it in about 4 months.",
};

function getAutoReply(text: string): string {
  const lower = text.toLowerCase();
  for (const [key, reply] of Object.entries(AUTO_REPLIES)) {
    if (lower.includes(key)) return reply;
  }
  return "That's a great question! I'm analyzing your financial data... Based on your recent transactions, I'd recommend reviewing your spending patterns from last month to identify areas for improvement.";
}

export default function AiAssistantScreen() {
  const router = useRouter();
  const colors = useColors();
  const styles = makeStyles(colors);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", text: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setQuery("");
    setIsTyping(true);

    setTimeout(() => {
      const reply = getAutoReply(text);
      const aiMsg: Message = { id: (Date.now() + 1).toString(), role: "assistant", text: reply };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <SafeAreaView style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <View style={styles.aiIconSmall}>
              <Feather name="cpu" size={16} color="#fff" />
            </View>
            <View>
              <Text style={styles.title}>AI Assistant</Text>
              <Text style={styles.subtitle}>Always online</Text>
            </View>
          </View>
          <View style={styles.betaBadge}>
            <Text style={styles.betaText}>BETA</Text>
          </View>
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListFooterComponent={isTyping ? (
            <View style={styles.typingBubble}>
              <Text style={styles.typingText}>AI is thinking...</Text>
            </View>
          ) : null}
          renderItem={({ item }) => (
            <View style={[
              styles.messageBubble,
              item.role === "user" ? styles.userBubble : styles.aiBubble
            ]}>
              {item.role === "assistant" && (
                <View style={styles.aiAvatarSmall}>
                  <Feather name="cpu" size={12} color={colors.primary} />
                </View>
              )}
              <View style={[
                styles.bubbleContent,
                item.role === "user" ? styles.userBubbleContent : styles.aiBubbleContent
              ]}>
                <Text style={[
                  styles.bubbleText,
                  item.role === "user" ? styles.userBubbleText : styles.aiBubbleText
                ]}>{item.text}</Text>
              </View>
            </View>
          )}
        />

        {/* Suggestions row (if first message only) */}
        {messages.length === 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestionsRow}>
            {SUGGESTIONS.map((s, i) => (
              <TouchableOpacity key={i} style={styles.suggestionChip} onPress={() => sendMessage(s)}>
                <Text style={styles.suggestionText}>{s}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Ask a financial question..."
              placeholderTextColor={colors.mutedForeground}
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={() => sendMessage(query)}
              returnKeyType="send"
            />
            <TouchableOpacity 
              style={[styles.sendBtn, !query.trim() && { opacity: 0.5 }]}
              disabled={!query.trim()}
              onPress={() => sendMessage(query)}
            >
              <Feather name="send" size={18} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function makeStyles(colors: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.card,
    },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerCenter: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    aiIconSmall: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontSize: 15,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
    },
    subtitle: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: colors.emerald,
    },
    betaBadge: {
      backgroundColor: colors.primary,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 10,
    },
    betaText: {
      color: '#ffffff',
      fontSize: 10,
      fontFamily: "Inter_700Bold",
    },
    messageList: {
      padding: 16,
      paddingBottom: 12,
      gap: 12,
      flexGrow: 1,
    },
    messageBubble: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 8,
      marginBottom: 4,
    },
    userBubble: {
      justifyContent: 'flex-end',
    },
    aiBubble: {
      justifyContent: 'flex-start',
    },
    aiAvatarSmall: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.purpleLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    bubbleContent: {
      maxWidth: '75%',
      padding: 14,
      borderRadius: 18,
    },
    userBubbleContent: {
      backgroundColor: colors.primary,
      borderBottomRightRadius: 4,
    },
    aiBubbleContent: {
      backgroundColor: colors.card,
      borderBottomLeftRadius: 4,
      borderWidth: 1,
      borderColor: colors.border,
    },
    bubbleText: {
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      lineHeight: 20,
    },
    userBubbleText: {
      color: '#ffffff',
    },
    aiBubbleText: {
      color: colors.foreground,
    },
    typingBubble: {
      alignSelf: 'flex-start',
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 16,
      paddingVertical: 10,
      marginLeft: 36,
    },
    typingText: {
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      fontSize: 14,
    },
    suggestionsRow: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      gap: 10,
    },
    suggestionChip: {
      backgroundColor: colors.card,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    suggestionText: {
      fontSize: 13,
      fontFamily: "Inter_500Medium",
      color: colors.primary,
    },
    inputContainer: {
      paddingHorizontal: 16,
      paddingTop: 10,
      paddingBottom: 10,
      backgroundColor: colors.card,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background,
      borderRadius: 28,
      paddingLeft: 18,
      paddingRight: 6,
      paddingVertical: 6,
      borderWidth: 1,
      borderColor: colors.border,
    },
    input: {
      flex: 1,
      fontSize: 15,
      fontFamily: "Inter_400Regular",
      color: colors.foreground,
      paddingVertical: 10,
    },
    sendBtn: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}
