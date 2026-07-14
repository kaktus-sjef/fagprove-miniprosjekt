import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  createUserWithEmailAndPassword,
  getRedirectResult,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signInWithRedirect,
  User
} from "firebase/auth";

import { auth, googleProvider } from "../../firebase/firebase";

import {
  createUserProfile,
  getLoginProviderByEmail,
  getUserProfile,
  syncUserAfterLogin
} from "../../services/userService";

import { FcGoogle } from "react-icons/fc";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";

import NetworkBackground from "../../components/networkBackground/networkBackground";
import { useAuth } from "../../context/authContext";

import "./login.css";

function Login() {
  const navigate = useNavigate();
  const hasCheckedRedirect = useRef(false);
  const { user, loading } = useAuth();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [pendingGoogleUser, setPendingGoogleUser] = useState<User | null>(null);
  const [redirectChecked, setRedirectChecked] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [fieldErrors, setFieldErrors] = useState({
    name: false,
    email: false,
    password: false
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
    if (!redirectChecked || loading || pendingGoogleUser || !user) return;
    navigate("/dashboard", { replace: true });
  }, [loading, navigate, pendingGoogleUser, redirectChecked, user]);

  const validateFields = () => {
    const errors = {
      name: isSignUp && !name.trim(),
      email: !email.trim(),
      password: !password
    };

    setFieldErrors(errors);

    return !errors.name && !errors.email && !errors.password;
  };

  const handleLogin = async () => {
    setError("");

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

      void syncUserAfterLogin(userCredential.user).catch((error) => {
        console.error("Kunne ikke oppdatere sist innlogget:", error);
      });

      navigate("/dashboard");
    } catch (error: any) {
      console.error("Feil ved innlogging:", error);

      if (error.code === "auth/invalid-credential") {
        setError("Feil e-post eller passord.");
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

  const handleSignUp = async () => {
    setError("");

    if (!validateFields()) return;

    if (password.length < 6) {
      setError("Passord må være minst 6 tegn.");
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

      await sendEmailVerification(userCredential.user);

      await createUserProfile(userCredential.user, {
        name,
        phone,
        authProvider: "password"
      });

      navigate("/dashboard");
    } catch (error: any) {
      console.error("Feil ved registrering:", error);

      if (error.code === "auth/email-already-in-use") {
        setError("E-posten er allerede registrert.");
      } else if (error.code === "auth/invalid-email") {
        setError("Ugyldig e-postadresse.");
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
        password: false
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
                <label>
                  Navn
                  <span style={{ color: fieldErrors.name ? "red" : "#ccc" }}>
                    *
                  </span>
                </label>

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
                <label>
                  E-post
                  <span style={{ color: fieldErrors.email ? "red" : "#ccc" }}>
                    *
                  </span>
                </label>

                <input
                  type="email"
                  placeholder="epost@firma.no"
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
                <label>
                  Passord
                  <span style={{ color: fieldErrors.password ? "red" : "#ccc" }}>
                    *
                  </span>
                </label>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="********"
                    value={password}
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
                      flex: 1,
                      borderColor: fieldErrors.password ? "red" : "",
                      textTransform: "none"
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "18px",
                      width: "auto",
                      color: "#64748b"
                    }}
                    aria-label={showPassword ? "Skjul passord" : "Vis passord"}
                  >
                    {showPassword
                      ? FaRegEye({ className: "icon" })
                      : FaRegEyeSlash({ className: "icon" })}
                  </button>
                </div>
              </div>
            </>
          )}

          {error && <p style={{ color: "red" }}>{error}</p>}

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
                      password: false
                    });
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
