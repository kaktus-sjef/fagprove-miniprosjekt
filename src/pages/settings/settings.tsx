import Header from "../../components/header/header";
import Sidebar from "../../components/sidebar/sidebar";

import "../adminShared/adminPages.css";

function Settings() {
  return (
    <main className="admin-page">
      <Sidebar />

      <section className="admin-main">
        <Header title="Innstillinger" />

        <div className="admin-body">
          <section className="admin-panel">
            <div className="admin-panel-header">
              <div>
                <h2>Innstillinger</h2>
                <p>Konfigurer sikkerhet, varsler og standardvalg.</p>
              </div>
            </div>

            <div className="admin-grid">
              <article className="admin-card">
                <h3>Sikkerhet</h3>
                <p>Firebase Auth holder brukere innlogget med lokal persistence og beskytter private ruter.</p>
              </article>

              <article className="admin-card">
                <h3>Varsler</h3>
                <p>Sett opp hvilke systemhendelser som skal vises i header og aktivitetslogg.</p>
              </article>

              <article className="admin-card">
                <h3>Standardrolle</h3>
                <p>Nye brukere får rollen Venter til en administrator gir dem riktig tilgang.</p>
              </article>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

export default Settings;
