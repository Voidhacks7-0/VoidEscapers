import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ThemeType = 'white-black' | 'white-blue' | 'white-aqua';

interface ThemeState {
    currentTheme: ThemeType;
}

const initialState: ThemeState = {
    currentTheme: 'white-black',
};

const themeSlice = createSlice({
    name: 'theme',
    initialState,
    reducers: {
        setTheme: (state, action: PayloadAction<ThemeType>) => {
            state.currentTheme = action.payload;
        },
    },
});

export const { setTheme } = themeSlice.actions;
export default themeSlice.reducer;
