import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { ThemeColors } from '../types';

const themes: Record<string, ThemeColors> = {
    'white-black': {
        background: '#FFFFFF',
        card: '#F5F5F5',
        text: '#000000',
        primary: '#000000',
        secondary: '#333333',
        accent: '#666666',
    },
    'white-blue': {
        background: '#F0F8FF',
        card: '#FFFFFF',
        text: '#000000',
        primary: '#007AFF',
        secondary: '#5AC8FA',
        accent: '#0056B3',
    },
    'white-aqua': {
        background: '#E0FFFF',
        card: '#FFFFFF',
        text: '#000000',
        primary: '#00CED1',
        secondary: '#20B2AA',
        accent: '#008B8B',
    },
};

export const useAppTheme = () => {
    const currentTheme = useSelector((state: RootState) => state.theme.currentTheme);
    return themes[currentTheme];
};
