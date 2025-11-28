import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { HealthLog } from '../types';

interface HealthState {
    healthData: Record<string, HealthLog[]>; // userId -> logs
}

const initialState: HealthState = {
    healthData: {},
};

const healthSlice = createSlice({
    name: 'health',
    initialState,
    reducers: {
        setHealthData: (state, action: PayloadAction<{ userId: string; logs: HealthLog[] }>) => {
            state.healthData[action.payload.userId] = action.payload.logs;
        },
        addHealthLog: (state, action: PayloadAction<HealthLog>) => {
            const { userId } = action.payload;
            if (!state.healthData[userId]) {
                state.healthData[userId] = [];
            }
            state.healthData[userId].push(action.payload);
        },
    },
});

export const { setHealthData, addHealthLog } = healthSlice.actions;
export default healthSlice.reducer;
