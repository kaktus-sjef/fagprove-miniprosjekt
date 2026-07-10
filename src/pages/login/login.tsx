import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";

import { auth, googleProvider } from "../../firebase/firebase";

import { FcGoogle } from "react-icons/fc";
import { FaRegEye, FaRegEyeSlash  } from "react-icons/fa6";
import NetworkBackground from "../../components/networkBackground/networkBackground";

import "./login.css";


function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isSignUp, setIsSignUp] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({ email: false, password: false });

    const validateFields = () => {
        const errors = {
            email: !email,
            password: !password
        };
        setFieldErrors(errors);
        return !errors.email && !errors.password;
    };

    const handleLogin = async () => {

        if (!validateFields()) {
            return;
        }

        try {

            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

            navigate("/dashboard");

        } catch (error) {

            setError("Feil e-post eller passord");

        }
    };

    const handleGoogleLogin = async () => {

        try {

            await signInWithPopup(
                auth,
                googleProvider
            );

            navigate("/dashboard");

        } catch (error) {

            setError("Kunne ikke logge inn med Google");

        }

    };

    const handleSignUp = async () => {

        if (!validateFields()) {
            return;
        }

        if (password.length < 6) {
            setError("Passord må være minst 6 tegn");
            return;
        }

        try {

            await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

            navigate("/dashboard");

        } catch (error: any) {

            if (error.code === "auth/email-already-in-use") {
                setError("E-posten er allerede registrert");
            } else if (error.code === "auth/invalid-email") {
                setError("Ugyldig e-postadresse");
            } else {
                setError("Feil ved registrering. Prøv igjen.");
            }

        }
    };

    return (
        <div className="login-page">
            
            <NetworkBackground />
            <div className="login-card">

                <h1>Administrasjonssenter</h1>

                <p>{isSignUp ? "Opprett ny bruker" : "Logg inn for å fortsette"}</p>


                <form>

                    <div className="form-group">

                        <label>
                            E-post
                            <span style={{ color: fieldErrors.email ? "red" : "#ccc" }}>*</span>
                        </label>

                        <input
                            type="email"
                            placeholder="epost@firma.no"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                if (fieldErrors.email && e.target.value) {
                                    setFieldErrors({ ...fieldErrors, email: false });
                                }
                            }}
                            style={{ borderColor: fieldErrors.email ? "red" : "" }}
                        />

                    </div>


                    <div className="form-group">

                        <label>
                            Passord
                            <span style={{ color: fieldErrors.password ? "red" : "#ccc" }}>*</span>
                        </label>

                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="********"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    if (fieldErrors.password && e.target.value) {
                                        setFieldErrors({ ...fieldErrors, password: false });
                                    }
                                }}
                                style={{
                                    flex: 1,
                                    borderColor: fieldErrors.password ? "red" : ""
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    fontSize: "18px"
                                }}
                            >
                                {showPassword ? FaRegEye({className: "icon"}) : FaRegEyeSlash({className: "icon"})}
                            </button>
                        </div>

                    </div>


                    {error && <p style={{ color: "red" }}>{error}</p>}


                    <button
                        type="button"
                        onClick={isSignUp ? handleSignUp : handleLogin}
                    >
                        {isSignUp ? "Opprett bruker" : "Logg inn"}
                    </button>
                    <p style={{ textAlign: "center", margin: "12px 0" }}>eller</p>
                    <button
                        type="button"
                        onClick={handleGoogleLogin}
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

                </form>

                <p style={{ marginTop: "20px", textAlign: "center" }}>
                    {isSignUp ? "Har du allerede en bruker? " : "Har du ikke en bruker? "}
                    <button
                        type="button"
                        onClick={() => {
                            setIsSignUp(!isSignUp);
                            setError("");
                            setFieldErrors({ email: false, password: false });
                        }}
                        style={{ background: "none", border: "none", color: "#0F766E", cursor: "pointer", textDecoration: "underline" }}
                    >
                        {isSignUp ? "Logg inn" : "Opprett bruker"}
                    </button>
                </p>

            </div>

        </div>
    );
}


export default Login;