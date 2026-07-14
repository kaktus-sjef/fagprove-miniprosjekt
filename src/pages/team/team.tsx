import Header from "../../components/header/header";
import Sidebar from "../../components/sidebar/sidebar";

import "../adminShared/adminPages.css";

const teams = [
  { name: "Administrasjon", members: 4, lead: "Ikke satt" },
  { name: "Sikkerhet", members: 3, lead: "Ikke satt" },
  { name: "Økonomi", members: 2, lead: "Ikke satt" },
  { name: "IT", members: 5, lead: "Ikke satt" },
  { name: "Kundeservice", members: 6, lead: "Ikke satt" },
  { name: "Salg", members: 4, lead: "Ikke satt" }
];

function Team() {
  return (
    <main className="admin-page">
      <Sidebar />

      <section className="admin-main">
        <Header title="Team" />

        <div className="admin-body">
          <section className="admin-panel">
            <div className="admin-panel-header">
              <div>
                <h2>Team</h2>
                <p>Oversikt over grupper og ansvarlige.</p>
              </div>
            </div>

            <div className="admin-table">
              <table>
                <thead>
                  <tr>
                    <th>Team</th>
                    <th>Medlemmer</th>
                    <th>Ansvarlig</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {teams.map((team) => (
                    <tr key={team.name}>
                      <td>{team.name}</td>
                      <td>{team.members}</td>
                      <td>{team.lead}</td>
                      <td>
                        <span className="admin-badge success">Aktiv</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

export default Team;
