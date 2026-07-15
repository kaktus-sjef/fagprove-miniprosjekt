import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc
} from "firebase/firestore";

import { db } from "../firebase/firebase";
import { logActivity } from "./activityLogService";

export type TeamStatus = "active" | "inactive";
export type TeamColor = "red" | "purple" | "green" | "blue" | "orange" | "pink" | "teal";
export type TeamIcon = "admin" | "security" | "accounting" | "it" | "customerservice" | "sales" | "team";

export type TeamProfile = {
  id: string;
  name: string;
  description: string;
  lead: string;
  status: TeamStatus;
  color?: TeamColor;
  icon?: TeamIcon;
  avatarUrl?: string;
  createdAt: any;
  updatedAt: any;
};

export type TeamInput = {
  name: string;
  description?: string;
  lead?: string;
  status: TeamStatus;
  color?: TeamColor;
  icon?: TeamIcon;
  avatarUrl?: string;
};

export async function getAllTeams() {
  const teamsRef = collection(db, "teams");
  const teamsQuery = query(teamsRef, orderBy("name"));
  const snapshot = await getDocs(teamsQuery);

  return snapshot.docs.map((teamDoc) => ({
    id: teamDoc.id,
    ...teamDoc.data()
  })) as TeamProfile[];
}

export async function createTeam(input: TeamInput) {
  const teamRef = doc(collection(db, "teams"));
  const teamName = input.name.trim();

  await setDoc(teamRef, {
    name: teamName,
    description: input.description?.trim() || "",
    lead: input.lead?.trim() || "",
    status: input.status,
    color: input.color || "teal",
    icon: input.icon || "team",
    avatarUrl: input.avatarUrl?.trim() || "",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  // AKTIVITETSLOGG: Nytt team opprettet.
  void logActivity({
    type: "team_created",
    level: "success",
    title: "Nytt team opprettet",
    description: `${teamName} ble lagt til som team.`,
    targetId: teamRef.id,
    targetName: teamName
  }).catch((error) => {
    console.error("Kunne ikke logge teamopprettelse:", error);
  });
}

export async function updateTeam(teamId: string, input: TeamInput) {
  const teamRef = doc(db, "teams", teamId);

  await updateDoc(teamRef, {
    name: input.name.trim(),
    description: input.description?.trim() || "",
    lead: input.lead?.trim() || "",
    status: input.status,
    color: input.color || "teal",
    icon: input.icon || "team",
    avatarUrl: input.avatarUrl?.trim() || "",
    updatedAt: serverTimestamp()
  });
}

export async function deleteTeam(teamId: string) {
  await deleteDoc(doc(db, "teams", teamId));
}
