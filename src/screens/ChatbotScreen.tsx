import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';
import { generateChatResponse } from '../services/geminiService';
import { ThreeDCard } from '../components/ThreeDCard';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
}

const ChatbotScreen = () => {
    const theme = useAppTheme();
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', text: 'Hello! I am your health assistant. How can I help you today?', sender: 'bot' },
    ]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const flatListRef = useRef<FlatList>(null);

    const sendMessage = async () => {
        if (!inputText.trim()) return;

        const userMsg: Message = { id: Date.now().toString(), text: inputText, sender: 'user' };
        setMessages((prev) => [...prev, userMsg]);
        setInputText('');
        setIsLoading(true);

        const responseText = await generateChatResponse(inputText);
        const botMsg: Message = { id: (Date.now() + 1).toString(), text: responseText, sender: 'bot' };

        setMessages((prev) => [...prev, botMsg]);
        setIsLoading(false);

        setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
    };

    const renderItem = ({ item }: { item: Message }) => (
        <View style={[
            styles.messageBubble,
            item.sender === 'user' ? styles.userBubble : styles.botBubble,
            item.sender === 'bot' && { backgroundColor: theme.card }
        ]}>
            <Text style={[
                styles.messageText,
                { color: item.sender === 'user' ? '#FFF' : theme.text }
            ]}>{item.text}</Text>
        </View>
    );

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: theme.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={90}
        >
            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
            />

            {isLoading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={theme.primary} />
                    <Text style={{ color: theme.secondary, marginLeft: 10 }}>Typing...</Text>
                </View>
            )}

            <View style={[styles.inputContainer, { backgroundColor: theme.card }]}>
                <TextInput
                    style={[styles.input, { color: theme.text }]}
                    value={inputText}
                    onChangeText={setInputText}
                    placeholder="Ask me anything..."
                    placeholderTextColor={theme.accent}
                />
                <TouchableOpacity style={[styles.sendButton, { backgroundColor: theme.primary }]} onPress={sendMessage}>
                    <Text style={styles.sendText}>Send</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listContent: {
        padding: 20,
        paddingBottom: 10,
    },
    messageBubble: {
        padding: 15,
        borderRadius: 20,
        marginBottom: 10,
        maxWidth: '80%',
    },
    userBubble: {
        alignSelf: 'flex-end',
        backgroundColor: '#007AFF',
        borderBottomRightRadius: 5,
    },
    botBubble: {
        alignSelf: 'flex-start',
        borderBottomLeftRadius: 5,
        elevation: 2,
    },
    messageText: {
        fontSize: 16,
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 10,
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 15,
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
    },
    input: {
        flex: 1,
        fontSize: 16,
        paddingHorizontal: 10,
    },
    sendButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        marginLeft: 10,
    },
    sendText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
});

export default ChatbotScreen;
