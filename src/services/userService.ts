import { User } from "firebase/auth";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where
} from "firebase/firestore";

import { db } from "../firebase/firebase";
import { logActivity } from "./activityLogService";

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

// Brukes før login/signup for å vite om e-posten skal bruke passord eller Google.
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

  // Nye brukere får alltid "waiting" til en administrator godkjenner rollen.
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

  // AKTIVITETSLOGG + ROLLE-GODKJENNING: Ny signup legges inn som "waiting" og varsles.
  void logActivity({
    type: "role_waiting",
    level: "warning",
    title: "Venter på rolle",
    description: `${profile.name} har opprettet bruker og venter på rolle-godkjenning.`,
    actorId: user.uid,
    actorName: profile.name,
    targetId: user.uid,
    targetName: profile.name
  }).catch((error) => {
    console.error("Kunne ikke logge rolle-venting:", error);
  });
}

export async function createManagedUserProfile(input: ManageUserInput) {
  const userRef = doc(collection(db, "users"));

  // Admin-oppretting lager en Firestore-profil. Selve Firebase Auth-kontoen må håndteres separat.
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

  // AKTIVITETSLOGG: Admin har opprettet en ny brukerprofil manuelt.
  void logActivity({
    type: profile.role === "waiting" ? "role_waiting" : "user_created",
    level: profile.role === "waiting" ? "warning" : "success",
    title: profile.role === "waiting" ? "Venter på rolle" : "Ny bruker opprettet",
    description: `${profile.name} ble opprettet${profile.role === "waiting" ? " og venter på rolle-godkjenning" : ""}.`,
    targetId: userRef.id,
    targetName: profile.name
  }).catch((error) => {
    console.error("Kunne ikke logge brukeropprettelse:", error);
  });
}

export async function updateManagedUserProfile(
  uid: string,
  input: ManageUserInput
) {
  const userRef = doc(db, "users", uid);

  // roleVerified følger rollen: waiting betyr ikke godkjent, alle andre roller godkjennes.
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

  // Holder Firestore-profilen oppdatert med Firebase Auth sin e-postverifisering.
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

export async function getWaitingRoleUsers() {
  const usersRef = collection(db, "users");
  const usersQuery = query(usersRef, where("role", "==", "waiting"));
  const snapshot = await getDocs(usersQuery);

  return snapshot.docs.map((doc) => doc.data() as UserProfile);
}
