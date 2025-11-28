import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { addHealthLog } from '../store/healthSlice';
import { RootState } from '../store';
import { useAppTheme } from '../hooks/useAppTheme';
import { ThreeDCard } from '../components/ThreeDCard';

const AddDataScreen = () => {
    const theme = useAppTheme();
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const user = useSelector((state: RootState) => state.auth.user);

    const [form, setForm] = useState({
        bp: '',
        pulseRate: '',
        stepsCount: '',
        sleepHours: '',
        weight: '',
        sugarLevel: '',
    });

    const handleSubmit = () => {
        if (!user) return;


        if (!form.bp || !form.pulseRate) {
            Alert.alert('Error', 'Please fill in at least BP and Pulse Rate');
            return;
        }

        const newLog = {
            date: new Date().toISOString().split('T')[0],
            bp: form.bp,
            pulseRate: parseInt(form.pulseRate) || 0,
            stepsCount: parseInt(form.stepsCount) || 0,
            sleepHours: parseFloat(form.sleepHours) || 0,
            calorieIntake: 2000,
            waterIntake: 2.0,
            weight: parseFloat(form.weight) || 70,
            sugarLevel: parseInt(form.sugarLevel) || 100,
            userId: user.id,
        };

        dispatch(addHealthLog(newLog));
        Alert.alert('Success', 'Health log added!');
        navigation.goBack();
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
            <ThreeDCard style={styles.formCard}>
                <Text style={[styles.label, { color: theme.text }]}>Blood Pressure (e.g., 120/80)</Text>
                <TextInput
                    style={[styles.input, { color: theme.text, borderColor: theme.secondary }]}
                    value={form.bp}
                    onChangeText={(text) => setForm({ ...form, bp: text })}
                    placeholder="120/80"
                    placeholderTextColor={theme.accent}
                />

                <Text style={[styles.label, { color: theme.text }]}>Pulse Rate (bpm)</Text>
                <TextInput
                    style={[styles.input, { color: theme.text, borderColor: theme.secondary }]}
                    value={form.pulseRate}
                    onChangeText={(text) => setForm({ ...form, pulseRate: text })}
                    keyboardType="numeric"
                    placeholder="75"
                    placeholderTextColor={theme.accent}
                />

                <Text style={[styles.label, { color: theme.text }]}>Steps Count</Text>
                <TextInput
                    style={[styles.input, { color: theme.text, borderColor: theme.secondary }]}
                    value={form.stepsCount}
                    onChangeText={(text) => setForm({ ...form, stepsCount: text })}
                    keyboardType="numeric"
                    placeholder="8000"
                    placeholderTextColor={theme.accent}
                />

                <Text style={[styles.label, { color: theme.text }]}>Sleep Hours</Text>
                <TextInput
                    style={[styles.input, { color: theme.text, borderColor: theme.secondary }]}
                    value={form.sleepHours}
                    onChangeText={(text) => setForm({ ...form, sleepHours: text })}
                    keyboardType="numeric"
                    placeholder="7.5"
                    placeholderTextColor={theme.accent}
                />

                <TouchableOpacity style={[styles.submitButton, { backgroundColor: theme.primary }]} onPress={handleSubmit}>
                    <Text style={styles.submitText}>Save Entry</Text>
                </TouchableOpacity>
            </ThreeDCard>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    formCard: {
        padding: 20,
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
        fontWeight: '600',
    },
    input: {
        borderWidth: 1,
        borderRadius: 10,
        padding: 10,
        marginBottom: 15,
        fontSize: 16,
    },
    submitButton: {
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
    },
    submitText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default AddDataScreen;
