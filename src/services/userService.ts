import { User } from "firebase/auth";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc
} from "firebase/firestore";

import { db } from "../firebase/firebase";

export type LoginProvider = "password" | "google";

export type UserRole = "waiting" | "admin" | "user" | "tester";

export type UserProfile = {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  team: string | null;
  role: UserRole;
  roleVerified: boolean;
  emailVerified: boolean;
  status: "active" | "inactive";
  authProvider: LoginProvider;
  createdAt: any;
  lastLogin: any;
};

type CreateProfileInput = {
  name: string;
  phone?: string;
  authProvider: LoginProvider;
};

export type ManageUserInput = {
  name: string;
  email?: string;
  phone?: string;
  team?: string;
  role: UserRole;
  status: "active" | "inactive";
};

export function getEmailKey(email: string) {
  return encodeURIComponent(email.trim().toLowerCase());
}

export async function getLoginProviderByEmail(email: string) {
  const emailKey = getEmailKey(email);
  const providerRef = doc(db, "authProviders", emailKey);
  const providerSnap = await getDoc(providerRef);

  if (!providerSnap.exists()) {
    return null;
  }

  return providerSnap.data() as {
    email: string;
    uid: string;
    provider: LoginProvider;
  };
}

export async function saveLoginProvider(
  user: User,
  provider: LoginProvider
) {
  if (!user.email) return;

  const emailKey = getEmailKey(user.email);

  await setDoc(doc(db, "authProviders", emailKey), {
    email: user.email.toLowerCase(),
    uid: user.uid,
    provider,
    updatedAt: serverTimestamp()
  });
}

export async function getUserProfile(uid: string) {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    return null;
  }

  return userSnap.data() as UserProfile;
}

export async function createUserProfile(
  user: User,
  input: CreateProfileInput
) {
  const userRef = doc(db, "users", user.uid);

  const profile: UserProfile = {
    uid: user.uid,
    name: input.name.trim(),
    email: user.email ?? "",
    phone: input.phone?.trim() || "",
    team: null,
    role: "waiting",
    roleVerified: false,
    emailVerified: user.emailVerified,
    status: "active",
    authProvider: input.authProvider,
    createdAt: serverTimestamp(),
    lastLogin: serverTimestamp()
  };

  await setDoc(userRef, profile);
  await saveLoginProvider(user, input.authProvider);
}

export async function createManagedUserProfile(input: ManageUserInput) {
  const userRef = doc(collection(db, "users"));

  const profile: UserProfile = {
    uid: userRef.id,
    name: input.name.trim(),
    email: input.email?.trim().toLowerCase() || "",
    phone: input.phone?.trim() || "",
    team: input.team?.trim() || null,
    role: input.role,
    roleVerified: input.role !== "waiting",
    emailVerified: false,
    status: input.status,
    authProvider: "password",
    createdAt: serverTimestamp(),
    lastLogin: null
  };

  await setDoc(userRef, profile);
}

export async function updateManagedUserProfile(
  uid: string,
  input: ManageUserInput
) {
  const userRef = doc(db, "users", uid);

  await updateDoc(userRef, {
    name: input.name.trim(),
    email: input.email?.trim().toLowerCase() || "",
    phone: input.phone?.trim() || "",
    team: input.team?.trim() || null,
    role: input.role,
    roleVerified: input.role !== "waiting",
    status: input.status
  });
}

export async function syncUserAfterLogin(user: User) {
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    return null;
  }

  await updateDoc(userRef, {
    lastLogin: serverTimestamp(),
    emailVerified: user.emailVerified
  });

  return userSnap.data() as UserProfile;
}
export async function getAllUsers() {
  const usersRef = collection(db, "users");
  const usersQuery = query(usersRef);
  const snapshot = await getDocs(usersQuery);

  return snapshot.docs.map((doc) => doc.data() as UserProfile);
}
