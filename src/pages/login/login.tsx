import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  createUserWithEmailAndPassword,
  getRedirectResult,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithRedirect,
  signOut,
  User
} from "firebase/auth";

import { auth, googleProvider } from "../../firebase/firebase";

import {
  createUserProfile,
  getLoginProviderByEmail,
  getUserProfile,
  syncUserAfterLogin
} from "../../services/userService";
import { logActivity } from "../../services/activityLogService";

import { FcGoogle } from "react-icons/fc";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";

import NetworkBackground from "../../components/networkBackground/networkBackground";
import { useAuth } from "../../context/authContext";

import "./login.css";

function getEmailVerificationSettings() {
  return {
    url: window.location.origin,
    handleCodeInApp: false
  };
}

function getPasswordResetSettings() {
  return {
    url: window.location.origin,
    handleCodeInApp: false
  };
}

function isValidPassword(password: string) {
  return password.length >= 8 && /\d/.test(password) && /[^A-Za-z0-9]/.test(password);
}

// E-POSTVERIFISERING: Sender Firebase sin verifiseringslenke etter signup og ved ikke-verifisert login.
async function sendVerificationEmail(user: User) {
  await sendEmailVerification(user, getEmailVerificationSettings());
}

function Login() {
  const navigate = useNavigate();
  const hasCheckedRedirect = useRef(false);
  const { user, loading } = useAuth();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [pendingGoogleUser, setPendingGoogleUser] = useState<User | null>(null);
  const [redirectChecked, setRedirectChecked] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [fieldErrors, setFieldErrors] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false
  });

  useEffect(() => {
  if (hasCheckedRedirect.current) return;
  hasCheckedRedirect.current = true;

  const handleRedirectResult = async () => {
    try {

      const result = await getRedirectResult(auth);
      const currentUser = result?.user;

      if (!currentUser) {
        return;
      }

      const existingProfile = await getUserProfile(currentUser.uid);

      if (existingProfile) {
        void syncUserAfterLogin(currentUser).catch((error) => {
          console.error("Kunne ikke oppdatere sist innlogget:", error);
        });
        navigate("/dashboard");
        return;
      }

      setPendingGoogleUser(currentUser);
      setName(currentUser.displayName ?? "");
      setEmail(currentUser.email ?? "");
      setIsSignUp(false);
    } catch (error) {
      console.error("Feil ved Google redirect:", error);
      setError("Kunne ikke fullføre Google-innlogging.");
    } finally {
      setRedirectChecked(true);
    }
  };

  handleRedirectResult();
}, [navigate]);

  useEffect(() => {
    if (!redirectChecked || loading || pendingGoogleUser || !user?.emailVerified) return;
    navigate("/dashboard", { replace: true });
  }, [loading, navigate, pendingGoogleUser, redirectChecked, user]);

  const validateFields = () => {
    const errors = {
      name: isSignUp && !name.trim(),
      email: !email.trim(),
      password: !password,
      confirmPassword: isSignUp && !confirmPassword
    };

    setFieldErrors(errors);

    return !errors.name && !errors.email && !errors.password && !errors.confirmPassword;
  };

  const handleLogin = async () => {
    setError("");
    setMessage("");

    if (!validateFields()) return;

    try {
      setIsLoading(true);

      const existingProvider = await getLoginProviderByEmail(email);

      if (existingProvider?.provider === "google") {
        setError(
          "Denne e-posten er registrert med Google. Fortsett med Google for å logge inn."
        );
        return;
      }

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      await userCredential.user.reload();

      // E-POSTVERIFISERING: Brukeren må verifisere e-post før tilgang til dashboard.
      if (!userCredential.user.emailVerified) {
        await sendVerificationEmail(userCredential.user);
        await signOut(auth);
        setError(
          "E-posten er ikke verifisert enda. Firebase har akseptert en ny verifiseringsmail. Sjekk innboks og spam."
        );
        return;
      }

      void syncUserAfterLogin(userCredential.user).catch((error) => {
        console.error("Kunne ikke oppdatere sist innlogget:", error);
      });

      // AKTIVITETSLOGG: Registrerer verifisert innlogging uten å blokkere login-flowen.
      void logActivity({
        type: "login",
        level: "info",
        title: "Ny innlogging",
        description: `${userCredential.user.email ?? "En bruker"} logget inn.`,
        actorId: userCredential.user.uid,
        actorName: userCredential.user.email ?? ""
      }).catch((error) => {
        console.error("Kunne ikke logge innlogging:", error);
      });

      navigate("/dashboard");
    } catch (error: any) {
      console.error("Feil ved innlogging:", error);

      if (error.code === "auth/invalid-credential") {
        setError("Feil e-post eller passord.");
      } else if (error.code === "auth/too-many-requests") {
        setError("Firebase har stoppet flere e-poster midlertidig. Prøv igjen litt senere.");
      } else if (error.code === "auth/unauthorized-continue-uri") {
        setError("Domenet er ikke autorisert i Firebase Authentication. Legg til domenet under Authorized domains.");
      } else {
        setError("Kunne ikke logge inn.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
  setError("");

  try {
    setIsLoading(true);

    await signInWithRedirect(auth, googleProvider);
  } catch (error) {
    console.error("Feil ved Google-login:", error);
    setError("Kunne ikke starte Google-login.");
    setIsLoading(false);
  }
};

  // PASSORD RESET: Sender Firebase sin reset-lenke til e-postadressen i feltet.
  const handlePasswordReset = async () => {
    setError("");
    setMessage("");

    if (!email.trim()) {
      setFieldErrors((current) => ({
        ...current,
        email: true
      }));
      setError("Skriv inn e-postadressen din først.");
      return;
    }

    try {
      setIsLoading(true);

      const existingProvider = await getLoginProviderByEmail(email);

      if (existingProvider?.provider === "google") {
        setError("Denne e-posten bruker Google-innlogging. Fortsett med Google i stedet.");
        return;
      }

      await sendPasswordResetEmail(
        auth,
        email.trim(),
        getPasswordResetSettings()
      );

      setMessage("Vi har sendt en e-post med lenke for å resette passordet ditt.");
    } catch (error: any) {
      console.error("Feil ved passord-reset:", error);

      if (error.code === "auth/invalid-email") {
        setError("Ugyldig e-postadresse.");
      } else if (error.code === "auth/too-many-requests") {
        setError("Firebase har stoppet flere e-poster midlertidig. Prøv igjen litt senere.");
      } else if (error.code === "auth/unauthorized-continue-uri") {
        setError("Domenet er ikke autorisert i Firebase Authentication. Legg til domenet under Authorized domains.");
      } else {
        setMessage("Hvis e-posten finnes hos oss, sendes det en reset-lenke.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async () => {
    setError("");
    setMessage("");

    if (!validateFields()) return;

    if (!isValidPassword(password)) {
      setError("Passordet må ha minst 8 tegn, ett tall og ett spesialtegn.");
      setFieldErrors((current) => ({
        ...current,
        password: true
      }));
      return;
    }

    if (password !== confirmPassword) {
      setError("Passordene er ikke like.");
      setFieldErrors((current) => ({
        ...current,
        confirmPassword: true
      }));
      return;
    }

    try {
      setIsLoading(true);

      const existingProvider = await getLoginProviderByEmail(email);

      if (existingProvider?.provider === "google") {
        setError(
          "Denne e-posten er allerede registrert med Google. Fortsett med Google for å logge inn."
        );
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      await userCredential.user.getIdToken(true);

      await createUserProfile(userCredential.user, {
        name,
        phone,
        authProvider: "password"
      });

      // E-POSTVERIFISERING: Ny bruker må bekrefte e-post før første innlogging.
      await sendVerificationEmail(userCredential.user);

      await signOut(auth);
      setIsSignUp(false);
      setPassword("");
      setConfirmPassword("");
      setMessage(
        "Brukeren er opprettet. Sjekk e-posten din og trykk på verifiseringslenken før du logger inn."
      );
    } catch (error: any) {
      console.error("Feil ved registrering:", error);

      if (error.code === "auth/email-already-in-use") {
        setError("E-posten er allerede registrert.");
      } else if (error.code === "auth/invalid-email") {
        setError("Ugyldig e-postadresse.");
      } else if (error.code === "auth/too-many-requests") {
        setError("Firebase har stoppet flere e-poster midlertidig. Prøv igjen litt senere.");
      } else if (error.code === "auth/unauthorized-continue-uri") {
        setError("Domenet er ikke autorisert i Firebase Authentication. Legg til domenet under Authorized domains.");
      } else if (error.code === "permission-denied") {
        setError("Brukeren ble opprettet, men profilen kunne ikke lagres.");
      } else {
        setError("Feil ved registrering. Prøv igjen.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteGoogleProfile = async () => {
    setError("");

    if (!pendingGoogleUser) return;

    if (!name.trim()) {
      setFieldErrors({
        name: true,
        email: false,
        password: false,
        confirmPassword: false
      });
      return;
    }

    try {
      setIsLoading(true);

      await createUserProfile(pendingGoogleUser, {
        name,
        phone,
        authProvider: "google"
      });

      navigate("/dashboard");
    } catch (error) {
      console.error("Feil ved fullføring av Google-profil:", error);
      setError("Kunne ikke fullføre profilen.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (pendingGoogleUser) {
      await handleCompleteGoogleProfile();
      return;
    }

    if (isSignUp) {
      await handleSignUp();
    } else {
      await handleLogin();
    }
  };

  return (
    <div className="login-page">
      <NetworkBackground />

      <div className="login-card">
        <h1>Administrasjonssenter</h1>

        <p>
          {pendingGoogleUser
            ? "Fullfør profilen for å fortsette"
            : isSignUp
              ? "Opprett ny bruker"
              : "Logg inn for å fortsette"}
        </p>

        <form onSubmit={handleSubmit}>
          {(isSignUp || pendingGoogleUser) && (
            <>
              <div className="form-group">
                <div>
                  <span style={{ color: fieldErrors.name ? "red" : "#ccc" }}>
                    *
                  </span>
                  <label> Navn </label>
                </div>

                <input
                  type="text"
                  placeholder="Ola Nordmann"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);

                    if (fieldErrors.name && e.target.value.trim()) {
                      setFieldErrors({
                        ...fieldErrors,
                        name: false
                      });
                    }
                  }}
                  style={{
                    borderColor: fieldErrors.name ? "red" : ""
                  }}
                />
              </div>

              <div className="form-group">
                <label>Telefonnummer</label>

                <input
                  type="tel"
                  placeholder="Valgfritt"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </>
          )}

          {!pendingGoogleUser && (
            <>
              <div className="form-group">
                <div>
                  <span style={{ color: fieldErrors.email ? "red" : "#ccc" }}>
                    *
                  </span>
                  <label> E-post </label>
                </div>

                <input
                  type="email"
                  placeholder="epost@firma.no"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);

                    if (fieldErrors.email && e.target.value.trim()) {
                      setFieldErrors({
                        ...fieldErrors,
                        email: false
                      });
                    }
                  }}
                  style={{
                    borderColor: fieldErrors.email ? "red" : ""
                  }}
                />
              </div>

              <div className="form-group">
                <div>
                  <span style={{ color: fieldErrors.password ? "red" : "#ccc" }}>
                    *
                  </span>
                  <label> Passord </label>
                </div>

                <div className="password-row">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Skriv inn ett passord"
                    value={password}
                    autoComplete={isSignUp ? "new-password" : "current-password"}
                    onChange={(e) => {
                      setPassword(e.target.value);

                      if (fieldErrors.password && e.target.value) {
                        setFieldErrors({
                          ...fieldErrors,
                          password: false
                        });
                      }
                    }}
                    style={{
                      borderColor: fieldErrors.password ? "red" : "",
                      textTransform: "none"
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="password-toggle-button"
                    aria-label={showPassword ? "Skjul passord" : "Vis passord"}
                  >
                    {showPassword
                      ? FaRegEye({ className: "icon" })
                      : FaRegEyeSlash({ className: "icon" })}
                  </button>
                </div>

                {isSignUp && (
                  <p className="password-requirements">
                    Passordet må ha minst 8 tegn, ett tall og ett spesialtegn.
                  </p>
                )}

                {!isSignUp && (
                  <button
                    type="button"
                    className="password-reset-button"
                    onClick={handlePasswordReset}
                    disabled={isLoading}
                  >
                    Glemt passord?
                  </button>
                )}
              </div>

              {isSignUp && (
                <div className="form-group">
                  <div>
                    <span style={{ color: fieldErrors.confirmPassword ? "red" : "#ccc" }}>
                      *
                    </span>
                    <label> Gjenta passord </label>
                  </div>

                  <div className="password-row">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Skriv inn ett passord"
                      value={confirmPassword}
                      autoComplete="new-password"
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);

                        if (fieldErrors.confirmPassword && e.target.value) {
                          setFieldErrors({
                            ...fieldErrors,
                            confirmPassword: false
                          });
                        }
                      }}
                      style={{
                        borderColor: fieldErrors.confirmPassword ? "red" : "",
                        textTransform: "none"
                      }}
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {error && <p style={{ color: "red" }}>{error}</p>}
          {message && <p style={{ color: "#0f766e" }}>{message}</p>}

          <button type="submit" disabled={isLoading}>
            {isLoading
              ? pendingGoogleUser
                ? "Lagrer profil..."
                : isSignUp
                  ? "Oppretter bruker..."
                  : "Logger inn..."
              : pendingGoogleUser
                ? "Fortsett"
                : isSignUp
                  ? "Opprett bruker"
                  : "Logg inn"}
          </button>

          {!pendingGoogleUser && (
            <>
              <p style={{ textAlign: "center", margin: "12px 0" }}>eller</p>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                style={{
                  marginTop: "12px",
                  background: "#fff",
                  color: "#333",
                  border: "1px solid #ccc"
                }}
              >
                {FcGoogle({ className: "icon" })}
                Fortsett med Google
              </button>

              <p style={{ marginTop: "20px", textAlign: "center" }}>
                {isSignUp ? "Har du allerede en bruker? " : "Har du ikke en bruker? "}

                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError("");
                    setFieldErrors({
                      name: false,
                      email: false,
                      password: false,
                      confirmPassword: false
                    });
                    setPassword("");
                    setConfirmPassword("");
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#0f766e",
                    cursor: "pointer",
                    textDecoration: "underline",
                    width: "auto",
                    padding: 0
                  }}
                >
                  {isSignUp ? "Logg inn" : "Opprett bruker"}
                </button>
              </p>
            </>
          )}
        </form>
      </div>
    </div>
  );
}

export default Login;
