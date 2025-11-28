import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    interpolate,
    Extrapolate,
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '../hooks/useAppTheme';

interface ThreeDCardProps {
    children: React.ReactNode;
    style?: ViewStyle;
    gradientColors?: [string, string, ...string[]];
}

export const ThreeDCard: React.FC<ThreeDCardProps> = ({ children, style, gradientColors }) => {
    const theme = useAppTheme();
    const rotateX = useSharedValue(0);
    const rotateY = useSharedValue(0);

    const gesture = Gesture.Pan()
        .onBegin(() => { })
        .onUpdate((event) => {
            rotateX.value = withSpring(interpolate(event.translationY, [-100, 100], [10, -10], Extrapolate.CLAMP));
            rotateY.value = withSpring(interpolate(event.translationX, [-100, 100], [-10, 10], Extrapolate.CLAMP));
        })
        .onEnd(() => {
            rotateX.value = withSpring(0);
            rotateY.value = withSpring(0);
        });

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { perspective: 1000 },
                { rotateX: `${rotateX.value}deg` },
                { rotateY: `${rotateY.value}deg` },
            ],
        };
    });

    const Container = gradientColors ? LinearGradient : View;
    const containerProps = gradientColors ? { colors: gradientColors } : { style: { backgroundColor: theme.card } };

    return (
        <GestureDetector gesture={gesture}>
            <Animated.View style={[styles.wrapper, animatedStyle, style]}>

                <Container
                    {...containerProps}
                    style={[
                        styles.card,
                        !gradientColors && { backgroundColor: theme.card },
                        { shadowColor: theme.text }
                    ]}
                >
                    {children}
                </Container>
            </Animated.View>
        </GestureDetector>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        borderRadius: 20,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 8,
    },
    card: {
        borderRadius: 20,
        padding: 20,
        overflow: 'hidden',
        width: '100%',
    },
});
