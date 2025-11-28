import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import * as LocalAuthentication from 'expo-local-authentication';
import { login } from '../store/authSlice';
import { generateDummyUsers } from '../data/userGenerator';
import { useAppTheme } from '../hooks/useAppTheme';
import { ThreeDCard } from '../components/ThreeDCard';
import { User } from '../types';

// Map avatar strings to require statements
const avatarMap: Record<string, any> = {
    avatar1: require('../assets/avatars/avatar1.png'),
    avatar2: require('../assets/avatars/avatar2.png'),
    avatar3: require('../assets/avatars/avatar3.png'),
    avatar4: require('../assets/avatars/avatar4.png'),
    avatar5: require('../assets/avatars/avatar5.png'),
    avatar6: require('../assets/avatars/avatar6.png'),
    avatar7: require('../assets/avatars/avatar7.png'),
    avatar8: require('../assets/avatars/avatar8.png'),
    avatar9: require('../assets/avatars/avatar9.png'),
    avatar10: require('../assets/avatars/avatar10.png'),
};

const LoginScreen = () => {
    const theme = useAppTheme();
    const dispatch = useDispatch();
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        const dummyUsers = generateDummyUsers();
        setUsers(dummyUsers);
    }, []);

    const handleLogin = async (user: User) => {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();

        if (hasHardware && isEnrolled) {
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Authenticate to access your health data',
            });

            if (result.success) {
                dispatch(login(user));
            } else {
                Alert.alert('Authentication Failed', 'Please try again or use password (dummy bypass).');
                // For dummy app, allow bypass on failure if desired, or just enforce.
                // Let's allow bypass for testing if biometric fails/cancelled
                dispatch(login(user));
            }
        } else {
            // No biometrics, just login
            dispatch(login(user));
        }
    };

    const renderUserItem = ({ item }: { item: User }) => (
        <TouchableOpacity onPress={() => handleLogin(item)}>
            <ThreeDCard style={styles.userCard}>
                <Image source={avatarMap[item.avatar]} style={styles.avatar} />
                <View style={styles.userInfo}>
                    <Text style={[styles.userName, { color: theme.text }]}>{item.name}</Text>
                    <Text style={[styles.userEmail, { color: theme.secondary }]}>{item.email}</Text>
                </View>
            </ThreeDCard>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Text style={[styles.title, { color: theme.primary }]}>VoidEscapers Health</Text>
            <Text style={[styles.subtitle, { color: theme.secondary }]}>Select a profile to login</Text>

            <FlatList
                data={users}
                renderItem={renderUserItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 60,
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 30,
    },
    listContent: {
        paddingBottom: 40,
    },
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        padding: 15,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 15,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 18,
        fontWeight: '600',
    },
    userEmail: {
        fontSize: 14,
    },
});

export default LoginScreen;
