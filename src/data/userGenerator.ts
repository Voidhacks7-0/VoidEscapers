import { User } from '../types';

export const generateDummyUsers = (): User[] => {
    const users: User[] = [];
    const themes: User['theme'][] = ['white-black', 'white-blue', 'white-aqua'];
    const bloodGroups = ['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-', 'AB-'];

    for (let i = 1; i <= 10; i++) {
        users.push({
            id: `user-${i}`,
            name: `User ${i}`,
            email: `user${i}@example.com`,
            password: 'password123',
            bloodGroup: bloodGroups[Math.floor(Math.random() * bloodGroups.length)],
            avatar: `avatar${i}`,
            theme: themes[Math.floor(Math.random() * themes.length)],
        });
    }
    return users;
};
