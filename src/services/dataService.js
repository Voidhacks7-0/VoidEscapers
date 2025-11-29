import { db, auth } from '../firebase';
import { collection, addDoc, query, where, orderBy, limit, getDocs, Timestamp, writeBatch, doc, deleteDoc, setDoc, serverTimestamp, getDoc, onSnapshot } from 'firebase/firestore';

// --- Firestore Operations ---

export const addManualEntry = async (userId, metricType, value) => {
    if (!userId) throw new Error("User ID required");

    try {
        await addDoc(collection(db, "health_metrics"), {
            userId: userId,
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


export const getMetricHistory = async (userId, metricType, days = 14) => {
    if (!userId) return [];

    try {
        // Fetch ALL history for this user/metric (without orderBy to avoid index issues)
        const q = query(
            collection(db, "health_metrics"),
            where("userId", "==", userId),
            where("type", "==", metricType)
        );

        const querySnapshot = await getDocs(q);
        const history = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const date = data.timestamp.toDate();
            history.push({
                date: date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }),
                value: data.value,
                timestamp: date.toISOString(),
                rawTimestamp: date.getTime() // For sorting
            });
        });

        // Sort by timestamp descending
        history.sort((a, b) => b.rawTimestamp - a.rawTimestamp);

        // Slice to limit days (or entries) and reverse for chart (oldest to newest)
        return history.slice(0, days).reverse();
    } catch (error) {
        console.error(`Error fetching history for ${metricType}:`, error);
        return [];
    }
};

export const clearDatabase = async (userId) => {
    if (!userId) return;

    try {
        // Clear Health Metrics
        const qMetrics = query(
            collection(db, "health_metrics"),
            where("userId", "==", userId)
        );
        const snapshotMetrics = await getDocs(qMetrics);
        const batch = writeBatch(db);
        snapshotMetrics.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });

        // Clear Diet Logs
        const qDiet = query(
            collection(db, "diet_logs"),
            where("userId", "==", userId)
        );
        const snapshotDiet = await getDocs(qDiet);
        snapshotDiet.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });

        await batch.commit();
        console.log("User data cleared.");
    } catch (error) {
        console.error("Error clearing data:", error);
        throw error;
    }
};

// --- Diet Logging Operations ---

export const saveDietLog = async (userId, logData) => {
    if (!userId) throw new Error("User ID required");

    try {
        await addDoc(collection(db, "diet_logs"), {
            userId: userId,
            ...logData,
            timestamp: Timestamp.now()
        });
        return true;
    } catch (error) {
        console.error("Error saving diet log:", error);
        throw error;
    }
};

export const getDietLogs = async (userId, days = 7) => {
    if (!userId) return [];

    try {
        // Fetch ALL logs for this user (without orderBy to avoid index issues)
        const q = query(
            collection(db, "diet_logs"),
            where("userId", "==", userId)
        );

        const querySnapshot = await getDocs(q);
        const logs = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const date = data.timestamp.toDate();
            logs.push({
                id: doc.id,
                ...data,
                date: date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }),
                timestamp: date.toISOString(),
                rawTimestamp: date.getTime() // For sorting
            });
        });

        // Sort by timestamp descending
        logs.sort((a, b) => b.rawTimestamp - a.rawTimestamp);

        // Limit to recent 50
        return logs.slice(0, 50);
    } catch (error) {
        console.error("Error fetching diet logs:", error);
        return [];
    }
};

export const subscribeToDietLogs = (userId, callback) => {
    if (!userId) return () => { };

    // Get logs from the last 24 hours to ensure we see recent entries
    // Note: This subscription MIGHT fail if index is missing for orderBy.
    // If it fails, we should probably fallback to just fetching once or warn user.
    // For now, we'll keep it but if it fails, the user won't see real-time updates.
    // To be safe, let's remove orderBy here too if possible, but onSnapshot needs a query.
    // Without orderBy, we get random order. But we can sort on client.

    const q = query(
        collection(db, "diet_logs"),
        where("userId", "==", userId)
        // orderBy("timestamp", "desc") // Removed to avoid index requirement for now
    );

    console.log("Subscribing to diet logs for user:", userId);

    return onSnapshot(q, (snapshot) => {
        const logs = [];
        snapshot.forEach((doc) => {
            const data = doc.data();
            logs.push({
                id: doc.id,
                ...data,
                time: data.timestamp ? data.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A',
                timestamp: data.timestamp ? data.timestamp.toDate() : new Date(),
                rawTimestamp: data.timestamp ? data.timestamp.toDate().getTime() : 0
            });
        });

        // Sort in memory
        logs.sort((a, b) => b.rawTimestamp - a.rawTimestamp);

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
        // Removing orderBy here too to be safe, though limit(1) without orderBy is arbitrary.
        // But if index is missing, it crashes. Better to fetch all and sort in JS.
        const stepsQuery = query(
            collection(db, "health_metrics"),
            where("userId", "==", userId),
            where("type", "==", "steps")
        );
        const stepsSnapshot = await getDocs(stepsQuery);
        let steps = 0;
        if (!stepsSnapshot.empty) {
            const allSteps = stepsSnapshot.docs.map(d => d.data());
            allSteps.sort((a, b) => b.timestamp - a.timestamp);
            steps = allSteps[0].value;
        }

        // Get latest stress
        const stressQuery = query(
            collection(db, "health_metrics"),
            where("userId", "==", userId),
            where("type", "==", "stress")
        );
        const stressSnapshot = await getDocs(stressQuery);
        let stress = 0;
        if (!stressSnapshot.empty) {
            const allStress = stressSnapshot.docs.map(d => d.data());
            allStress.sort((a, b) => b.timestamp - a.timestamp);
            stress = allStress[0].value;
        }

        return { steps, stress };
    } catch (error) {
        console.error("Error fetching student metrics:", error);
        return { steps: 0, stress: 0 };
    }
};

export const subscribeToRecentMetrics = (userId, callback) => {
    // Listen for metrics added from now onwards (or slightly in the past to be safe)
    const startTime = new Date().toISOString();

    const q = query(
        collection(db, "health_metrics"),
        where("userId", "==", userId),
        where("timestamp", ">=", startTime)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const changes = [];
        snapshot.docChanges().forEach((change) => {
            if (change.type === "added") {
                changes.push({ id: change.doc.id, ...change.doc.data() });
            }
        });

        if (changes.length > 0) {
            callback(changes);
        }
    }, (error) => {
        console.error("Error subscribing to metrics:", error);
    });

    return unsubscribe;
};
