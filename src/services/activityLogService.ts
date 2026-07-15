import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  where
} from "firebase/firestore";

import { db } from "../firebase/firebase";

export type ActivityType =
  | "user_created"
  | "team_created"
  | "login"
  | "role_waiting"
  | "role_assigned";

export type ActivityLevel = "success" | "info" | "warning";

export type ActivityLogEntry = {
  id: string;
  type: ActivityType;
  level: ActivityLevel;
  title: string;
  description: string;
  actorId?: string;
  actorName?: string;
  targetId?: string;
  targetName?: string;
  read: boolean;
  createdAt: any;
};

export type ActivityInput = Omit<ActivityLogEntry, "id" | "createdAt" | "read"> & {
  read?: boolean;
};

// AKTIVITETSLOGG: Lagrer bare viktige hendelser som egne, små dokumenter i activityLogs.
export async function logActivity(input: ActivityInput) {
  await addDoc(collection(db, "activityLogs"), {
    ...input,
    read: input.read ?? false,
    createdAt: serverTimestamp()
  });
}

export async function getRecentActivities(maxItems = 30) {
  const activitiesQuery = query(
    collection(db, "activityLogs"),
    orderBy("createdAt", "desc"),
    limit(maxItems)
  );
  const snapshot = await getDocs(activitiesQuery);

  return snapshot.docs.map((activityDoc) => ({
    id: activityDoc.id,
    ...activityDoc.data()
  })) as ActivityLogEntry[];
}

export async function getUnreadActivityCount() {
  const unreadQuery = query(
    collection(db, "activityLogs"),
    where("read", "==", false)
  );
  const snapshot = await getDocs(unreadQuery);

  return snapshot.size;
}
