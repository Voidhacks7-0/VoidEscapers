import { db, auth } from '../firebase';
import { collection, addDoc, query, where, orderBy, limit, getDocs, Timestamp, writeBatch, doc, deleteDoc, setDoc, serverTimestamp, getDoc, onSnapshot } from 'firebase/firestore';

// --- Firestore Operations ---

export const addManualEntry = async (metricType, value) => {
    if (!auth.currentUser) throw new Error("User not authenticated");

    try {
        await addDoc(collection(db, "health_metrics"), {
            userId: auth.currentUser.uid,
            type: metricType,
            value: value,
            timestamp: Timestamp.now()
        });
        return true;
    } catch (error) {
        console.error("Error adding manual entry:", error);
        throw error;
    }
};

export const saveUserProfile = async (userData) => {
    if (!auth.currentUser) throw new Error("User not authenticated");

    try {
        await setDoc(doc(db, "users", auth.currentUser.uid), {
            ...userData,
            updatedAt: Timestamp.now()
        }, { merge: true });
        return true;
    } catch (error) {
        console.error("Error saving profile:", error);
        throw error;
    }
};


export const getMetricHistory = async (metricType, days = 14) => {
    if (!auth.currentUser) return [];

    try {
        const q = query(
            collection(db, "health_metrics"),
            where("userId", "==", auth.currentUser.uid),
            where("type", "==", metricType),
            orderBy("timestamp", "desc"),
            limit(days)
        );

        const querySnapshot = await getDocs(q);
        const history = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const date = data.timestamp.toDate();
            history.push({
                date: date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }),
                value: data.value,
                timestamp: date.toISOString()
            });
        });

        // Return history reversed (oldest to newest) for the chart
        return history.reverse();
    } catch (error) {
        console.error(`Error fetching history for ${metricType}:`, error);
        return [];
    }
};

export const seedDatabase = async () => {
    if (!auth.currentUser) return;
    const userId = auth.currentUser.uid;

    // Check if data exists for this user
    // We check if there are at least 10 entries. If less, we assume it needs seeding.
    const q = query(
        collection(db, "health_metrics"),
        where("userId", "==", userId),
        limit(10)
    );
    const snapshot = await getDocs(q);

    // If we have a decent amount of data, skip seeding to avoid duplicates.
    if (snapshot.size >= 10) {
        console.log("Database already has data, skipping seed.");
        return;
    }

    console.log("Seeding database with 14 days of data...");
    const batch = writeBatch(db);
    const metrics = ['steps', 'calories', 'bp', 'spo2', 'sleep', 'sugar', 'stress', 'heart_rate'];
    const today = new Date();

    metrics.forEach(metric => {
        for (let i = 0; i < 14; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);

            let val = 0;
            switch (metric) {
                case 'steps': val = Math.floor(Math.random() * 5000) + 5000; break;
                case 'calories': val = Math.floor(Math.random() * 500) + 1500; break;
                case 'spo2': val = Math.floor(Math.random() * 3) + 96; break;
                case 'sleep': val = Math.floor(Math.random() * 3) + 6; break;
                case 'stress': val = Math.floor(Math.random() * 40) + 20; break;
                case 'sugar': val = Math.floor(Math.random() * 20) + 80; break;
                case 'heart_rate': val = Math.floor(Math.random() * 20) + 60; break;
                case 'bp': val = Math.floor(Math.random() * 20) + 110; break; // Systolic
            }

            const docRef = doc(collection(db, "health_metrics"));
            batch.set(docRef, {
                userId,
                type: metric,
                value: val,
                timestamp: Timestamp.fromDate(date)
            });
        }
    });

    await batch.commit();
    console.log("Database seeded successfully.");
};

export const clearDatabase = async () => {
    if (!auth.currentUser) return;
    const userId = auth.currentUser.uid;

    const q = query(
        collection(db, "health_metrics"),
        where("userId", "==", userId)
    );
    const snapshot = await getDocs(q);

    const batch = writeBatch(db);
    snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
    });

    await batch.commit();
    console.log("Database cleared.");
};

// --- Diet Logging Operations ---

export const saveDietLog = async (logData) => {
    if (!auth.currentUser) throw new Error("User not authenticated");

    try {
        await addDoc(collection(db, "diet_logs"), {
            userId: auth.currentUser.uid,
            ...logData,
            timestamp: Timestamp.now()
        });
        return true;
    } catch (error) {
        console.error("Error saving diet log:", error);
        throw error;
    }
};

export const getDietLogs = async (days = 7) => {
    if (!auth.currentUser) return [];

    try {
        const q = query(
            collection(db, "diet_logs"),
            where("userId", "==", auth.currentUser.uid),
            orderBy("timestamp", "desc"),
            limit(50) // Limit to recent 50 logs for now
        );

        const querySnapshot = await getDocs(q);
        const logs = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            logs.push({
                id: doc.id,
                ...data,
                date: data.timestamp.toDate().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }),
                timestamp: data.timestamp.toDate().toISOString()
            });
        });

        return logs;
    } catch (error) {
        console.error("Error fetching diet logs:", error);
        return [];
    }
};



export const subscribeToDietLogs = (callback) => {
    if (!auth.currentUser) return () => { };

    // Get logs from the last 24 hours to ensure we see recent entries
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const q = query(
        collection(db, "diet_logs"),
        where("userId", "==", auth.currentUser.uid),
        orderBy("timestamp", "desc")
    );

    console.log("Subscribing to diet logs for user:", auth.currentUser.uid);

    return onSnapshot(q, (snapshot) => {
        const logs = [];
        snapshot.forEach((doc) => {
            const data = doc.data();
            logs.push({
                id: doc.id,
                ...data,
                time: data.timestamp ? data.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A',
                timestamp: data.timestamp ? data.timestamp.toDate() : new Date()
            });
        });
        console.log("Fetched logs:", logs);
        callback(logs);
    }, (error) => {
        console.error("Error in diet log subscription:", error);
    });
};

// --- Community Chat Functions ---

export const saveMessage = async (messageData) => {
    if (!auth.currentUser) throw new Error("User not authenticated");

    try {
        await addDoc(collection(db, "community_messages"), {
            ...messageData,
            userId: auth.currentUser.uid,
            timestamp: serverTimestamp()
        });
    } catch (error) {
        console.error("Error saving message:", error);
        throw error;
    }
};

export const subscribeToMessages = (callback) => {
    const q = query(
        collection(db, "community_messages"),
        orderBy("timestamp", "asc")
    );

    return onSnapshot(q, (snapshot) => {
        const messages = [];
        snapshot.forEach((doc) => {
            const data = doc.data();
            messages.push({
                id: doc.id,
                ...data,
                timestamp: data.timestamp ? data.timestamp.toDate() : new Date()
            });
        });
        callback(messages);
    });
};

export const getUserProfile = async (userId) => {
    try {
        const docRef = doc(db, "users", userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return null;
    }
};

// --- Admin & College Functions ---

export const addCollege = async (collegeName) => {
    try {
        await addDoc(collection(db, "colleges"), {
            name: collegeName,
            timestamp: serverTimestamp()
        });
        return true;
    } catch (error) {
        console.error("Error adding college:", error);
        throw error;
    }
};

export const getColleges = async () => {
    try {
        const q = query(collection(db, "colleges"), orderBy("name", "asc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching colleges:", error);
        return [];
    }
};

export const getStudentsByCollege = async (collegeName) => {
    try {
        const q = query(collection(db, "users"), where("college", "==", collegeName));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching students:", error);
        return [];
    }
};

export const getStudentMetrics = async (userId) => {
    try {
        // Get latest steps
        const stepsQuery = query(
            collection(db, "health_metrics"),
            where("userId", "==", userId),
            where("type", "==", "steps"),
            orderBy("timestamp", "desc"),
            limit(1)
        );
        const stepsSnapshot = await getDocs(stepsQuery);
        const steps = stepsSnapshot.empty ? 0 : stepsSnapshot.docs[0].data().value;

        // Get latest stress
        const stressQuery = query(
            collection(db, "health_metrics"),
            where("userId", "==", userId),
            where("type", "==", "stress"),
            orderBy("timestamp", "desc"),
            limit(1)
        );
        const stressSnapshot = await getDocs(stressQuery);
        const stress = stressSnapshot.empty ? 0 : stressSnapshot.docs[0].data().value;

        return { steps, stress };
    } catch (error) {
        console.error("Error fetching student metrics:", error);
        return { steps: 0, stress: 0 };
    }
};
