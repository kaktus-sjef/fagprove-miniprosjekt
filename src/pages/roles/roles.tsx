import Header from "../../components/header/header";
import Sidebar from "../../components/sidebar/sidebar";

import "../adminShared/adminPages.css";

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
        </div>
      </section>
    </main>
  );
}

export default Roles;
