import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { RootState } from '../store';
import { setHealthData } from '../store/healthSlice';
import { generateHealthData } from '../data/healthGenerator';
import { useAppTheme } from '../hooks/useAppTheme';
import { ThreeDCard } from '../components/ThreeDCard';
import { LineChart } from 'react-native-gifted-charts';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const HomeScreen = () => {
    const theme = useAppTheme();
    const dispatch = useDispatch();
    const navigation = useNavigation<any>();
    const user = useSelector((state: RootState) => state.auth.user);
    const healthData = useSelector((state: RootState) => state.health.healthData[user?.id || '']);

    useEffect(() => {
        if (user && !healthData) {
            const data = generateHealthData(user.id);
            dispatch(setHealthData({ userId: user.id, logs: data }));
        }
    }, [user, healthData, dispatch]);

    if (!user || !healthData || healthData.length === 0) {
        return <View style={[styles.container, { backgroundColor: theme.background }]}><Text>Loading...</Text></View>;
    }

    const latestLog = healthData[healthData.length - 1];

    const pulseData = healthData.map(log => ({ value: log.pulseRate, label: log.date.slice(8) }));

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <View>
                    <Text style={[styles.greeting, { color: theme.text }]}>Hello, {user.name.split(' ')[0]}</Text>
                    <Text style={[styles.date, { color: theme.secondary }]}>{new Date().toDateString()}</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                    <Ionicons name="person-circle-outline" size={40} color={theme.primary} />
                </TouchableOpacity>
            </View>

            <Text style={[styles.sectionTitle, { color: theme.text }]}>Daily Highlights</Text>
            <View style={styles.highlightsContainer}>
                <ThreeDCard style={styles.highlightCard} gradientColors={['#FF6B6B', '#EE5253']}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="heart" size={24} color="#FFF" />
                        <Text style={styles.cardLabel}>Heart Rate</Text>
                    </View>
                    <Text style={styles.cardValue}>{latestLog.pulseRate} <Text style={styles.unit}>bpm</Text></Text>
                </ThreeDCard>

                <ThreeDCard style={styles.highlightCard} gradientColors={['#4834D4', '#686DE0']}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="walk" size={24} color="#FFF" />
                        <Text style={styles.cardLabel}>Steps</Text>
                    </View>
                    <Text style={styles.cardValue}>{latestLog.stepsCount}</Text>
                </ThreeDCard>
            </View>

            <View style={styles.highlightsContainer}>
                <ThreeDCard style={styles.highlightCard} gradientColors={['#F0932B', '#FFBE76']}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="flame" size={24} color="#FFF" />
                        <Text style={styles.cardLabel}>Calories</Text>
                    </View>
                    <Text style={styles.cardValue}>{latestLog.calorieIntake} <Text style={styles.unit}>kcal</Text></Text>
                </ThreeDCard>

                <ThreeDCard style={styles.highlightCard} gradientColors={['#6AB04C', '#BADC58']}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="water" size={24} color="#FFF" />
                        <Text style={styles.cardLabel}>Water</Text>
                    </View>
                    <Text style={styles.cardValue}>{latestLog.waterIntake} <Text style={styles.unit}>L</Text></Text>
                </ThreeDCard>
            </View>

            <Text style={[styles.sectionTitle, { color: theme.text }]}>Trends</Text>
            <ThreeDCard style={styles.chartCard}>
                <View style={styles.chartHeader}>
                    <Text style={[styles.chartTitle, { color: theme.text }]}>Pulse History</Text>
                    <Ionicons name="stats-chart" size={20} color={theme.primary} />
                </View>
                <LineChart
                    data={pulseData.slice(-7)}
                    height={180}
                    width={width - 80}
                    color={theme.primary}
                    thickness={3}
                    hideDataPoints={false}
                    dataPointsColor={theme.primary}
                    noOfSections={3}
                    yAxisTextStyle={{ color: theme.secondary, fontSize: 10 }}
                    xAxisLabelTextStyle={{ color: theme.secondary, fontSize: 10 }}
                    hideRules
                    curved
                />
            </ThreeDCard>

            <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick Actions</Text>
            <View style={styles.actionsContainer}>
                <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.card }]} onPress={() => navigation.navigate('Chatbot')}>
                    <Ionicons name="chatbubbles" size={24} color={theme.primary} />
                    <Text style={[styles.actionText, { color: theme.text }]}>Chat AI</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.card }]} onPress={() => navigation.navigate('Report')}>
                    <Ionicons name="document-text" size={24} color={theme.primary} />
                    <Text style={[styles.actionText, { color: theme.text }]}>Report</Text>
                </TouchableOpacity>
            </View>
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 25,
    },
    greeting: {
        fontSize: 28,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    date: {
        fontSize: 14,
        marginTop: 4,
        fontWeight: '500',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 15,
        marginTop: 10,
    },
    highlightsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    highlightCard: {
        width: '48%',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        opacity: 0.9,
    },
    cardLabel: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 8,
    },
    cardValue: {
        color: '#FFF',
        fontSize: 28,
        fontWeight: 'bold',
    },
    unit: {
        fontSize: 14,
        fontWeight: '500',
    },
    chartCard: {
        marginBottom: 25,
        paddingVertical: 20,
    },
    chartHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
        paddingHorizontal: 10,
    },
    chartTitle: {
        fontSize: 16,
        fontWeight: '700',
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: 15,
        width: '48%',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    actionText: {
        fontWeight: '600',
        marginLeft: 10,
    },
});

export default HomeScreen;
