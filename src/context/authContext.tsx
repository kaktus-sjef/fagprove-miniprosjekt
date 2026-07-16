import {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";

import {
  User,
  onAuthStateChanged
} from "firebase/auth";

import { auth } from "../firebase/firebase";
import { getUserProfile, UserProfile } from "../services/userService";

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  profileLoading: boolean;
  authError: string;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  profileLoading: false,
  authError: ""
});

export function AuthProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    let isMounted = true;

    // Firebase sier fra her hver gang brukeren logger inn, logger ut eller refreshes.
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setAuthError("");

      if (!currentUser) {
        setUser(null);
        setUserProfile(null);
        setProfileLoading(false);
        setLoading(false);
        return;
      }

      setUser(currentUser);
      setLoading(false);
      setProfileLoading(true);

      // Brukerprofilen ligger i Firestore og avgjør rolle/tilgang i appen.
      getUserProfile(currentUser.uid)
        .then((profile) => {
          // Hindrer at et gammelt async-svar overskriver state etter logout/brukerbytte.
          if (!isMounted || auth.currentUser?.uid !== currentUser.uid) return;
          setUserProfile(profile);
        })
        .catch((error) => {
          // Samme sikkerhet her: bare vis feilen hvis dette fortsatt er aktiv bruker.
          if (!isMounted || auth.currentUser?.uid !== currentUser.uid) return;
          console.error("Kunne ikke hente brukerprofil:", error);
          setUserProfile(null);
          setAuthError("Kunne ikke hente brukerprofil.");
        })
        .finally(() => {
          if (!isMounted || auth.currentUser?.uid !== currentUser.uid) return;
          setProfileLoading(false);
        });
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        profileLoading,
        authError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
