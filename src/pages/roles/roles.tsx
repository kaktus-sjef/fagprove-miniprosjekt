import { useEffect, useState } from "react";

import Header from "../../components/header/header";
import Sidebar from "../../components/sidebar/sidebar";
import {
  getWaitingRoleUsers,
  UserProfile
} from "../../services/userService";

import "./roles.css";

const roles = [
  {
    name: "Administrator",
    badge: "admin",
    description: "Full tilgang til brukere, team, roller og systeminnstillinger."
  },
  {
    name: "Bruker",
    badge: "user",
    description: "Standard tilgang til godkjente deler av administrasjonssystemet."
  },
  {
    name: "Tester",
    badge: "tester",
    description: "Kan teste funksjoner og kontrollere arbeidsflyter uten full admin-tilgang."
  },
  {
    name: "Venter",
    badge: "waiting",
    description: "Ny bruker som venter på rolle eller godkjenning."
  }
];

function Roles() {
  const [waitingUsers, setWaitingUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchWaitingUsers = async () => {
      try {
        setLoading(true);
        setError("");
        setWaitingUsers(await getWaitingRoleUsers());
      } catch (error) {
        console.error("Kunne ikke hente brukere som venter på rolle:", error);
        setError("Kunne ikke hente brukere som venter på rolle.");
      } finally {
        setLoading(false);
      }
    };

    fetchWaitingUsers();
  }, []);

  return (
    <main className="admin-page">
      <Sidebar />

      <section className="admin-main">
        <Header title="Roller" />

        <div className="admin-body">
          <section className="admin-panel">
            <div className="admin-panel-header">
              <div>
                <h2>Roller</h2>
                <p>Administrer tilgangsnivåer og ansvar.</p>
              </div>
            </div>

            <div className="admin-grid">
              {roles.map((role) => (
                <article key={role.badge} className="admin-card">
                  <h3>{role.name}</h3>
                  <p>{role.description}</p>
                  <span className="admin-badge" style={{ marginTop: "14px" }}>
                    {role.badge}
                  </span>
                </article>
              ))}
            </div>
          </section>

          <section className="admin-panel role-waiting-panel">
            <div className="admin-panel-header">
              <div>
                <h2>Venter på rolle</h2>
                <p>Brukere som har opprettet konto, men ikke fått tilgang enda.</p>
              </div>
            </div>

            {error && <p className="table-error">{error}</p>}

            <div className="waiting-role-list">
              {loading ? (
                <p className="empty-role-state">Henter brukere...</p>
              ) : waitingUsers.length === 0 ? (
                <p className="empty-role-state">Ingen brukere venter på rolle.</p>
              ) : (
                waitingUsers.map((user) => (
                  <article className="waiting-role-item" key={user.uid}>
                    <div>
                      <strong>{user.name || "Ukjent bruker"}</strong>
                      <p>{user.email || "Ingen e-post registrert"}</p>
                    </div>

                    <span className="admin-badge warning">waiting</span>
                  </article>
                ))
              )}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

export default Roles;
