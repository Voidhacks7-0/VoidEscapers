import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Switch, TextInput, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { setTheme, ThemeType } from '../store/themeSlice';
import { updateUser, logout } from '../store/authSlice';
import { useAppTheme } from '../hooks/useAppTheme';
import { ThreeDCard } from '../components/ThreeDCard';
import { Ionicons } from '@expo/vector-icons';

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

const ProfileScreen = () => {
    const theme = useAppTheme();
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.auth.user);

    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [biometricsEnabled, setBiometricsEnabled] = useState(true);

    if (!user) return null;

    const handleThemeChange = (newTheme: ThemeType) => {
        dispatch(setTheme(newTheme));
        dispatch(updateUser({ theme: newTheme }));
    };

    const handleSaveProfile = () => {
        Alert.alert('Success', 'Profile settings saved successfully!');
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <Image source={avatarMap[user.avatar]} style={styles.avatar} />
                <Text style={[styles.name, { color: theme.text }]}>{user.name}</Text>
                <Text style={[styles.email, { color: theme.secondary }]}>{user.email}</Text>
            </View>

            <ThreeDCard style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Ionicons name="color-palette" size={24} color={theme.primary} />
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>App Theme</Text>
                </View>
                <View style={styles.themeOptions}>
                    {['white-black', 'white-blue', 'white-aqua'].map((t) => (
                        <TouchableOpacity
                            key={t}
                            style={[
                                styles.themeButton,
                                { backgroundColor: t === 'white-black' ? '#333' : t === 'white-blue' ? '#007AFF' : '#00CED1' },
                                user.theme === t && styles.selectedTheme,
                            ]}
                            onPress={() => handleThemeChange(t as ThemeType)}
                        >
                            <Text style={styles.themeText}>{t.replace('white-', '')}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ThreeDCard>

            <ThreeDCard style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Ionicons name="person" size={24} color={theme.primary} />
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Personal Information</Text>
                </View>

                <Text style={[styles.label, { color: theme.secondary }]}>Full Name</Text>
                <TextInput
                    style={[styles.input, { color: theme.text, borderColor: theme.secondary }]}
                    value={user.name}
                    editable={false}
                />

                <Text style={[styles.label, { color: theme.secondary }]}>Email Address</Text>
                <TextInput
                    style={[styles.input, { color: theme.text, borderColor: theme.secondary }]}
                    value={user.email}
                    editable={false}
                />

                <TouchableOpacity style={[styles.saveButton, { backgroundColor: theme.primary }]} onPress={handleSaveProfile}>
                    <Text style={styles.saveText}>Save Changes</Text>
                </TouchableOpacity>
            </ThreeDCard>

            <ThreeDCard style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Ionicons name="settings" size={24} color={theme.primary} />
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Preferences</Text>
                </View>

                <View style={styles.row}>
                    <Text style={[styles.rowText, { color: theme.text }]}>Push Notifications</Text>
                    <Switch
                        value={notificationsEnabled}
                        onValueChange={setNotificationsEnabled}
                        trackColor={{ false: '#767577', true: theme.primary }}
                    />
                </View>

                <View style={styles.row}>
                    <Text style={[styles.rowText, { color: theme.text }]}>Biometric Login</Text>
                    <Switch
                        value={biometricsEnabled}
                        onValueChange={setBiometricsEnabled}
                        trackColor={{ false: '#767577', true: theme.primary }}
                    />
                </View>
            </ThreeDCard>

            <ThreeDCard style={styles.section}>
                <TouchableOpacity style={styles.logoutButton} onPress={() => dispatch(logout())}>
                    <Ionicons name="log-out" size={24} color="#FF3B30" />
                    <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>
            </ThreeDCard>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 10,
        borderWidth: 3,
        borderColor: '#FFF',
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    email: {
        fontSize: 16,
        marginBottom: 5,
    },
    section: {
        marginBottom: 20,
        padding: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    themeOptions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    themeButton: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 20,
    },
    selectedTheme: {
        borderWidth: 2,
        borderColor: '#000',
    },
    themeText: {
        color: '#FFF',
        fontWeight: 'bold',
        textTransform: 'capitalize',
    },
    label: {
        fontSize: 14,
        marginBottom: 5,
        fontWeight: '600',
    },
    input: {
        borderWidth: 1,
        borderRadius: 10,
        padding: 12,
        marginBottom: 15,
        fontSize: 16,
        opacity: 0.7,
    },
    saveButton: {
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 5,
    },
    saveText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    rowText: {
        fontSize: 16,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
    },
    logoutText: {
        color: '#FF3B30',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10,
    },
});

export default ProfileScreen;
