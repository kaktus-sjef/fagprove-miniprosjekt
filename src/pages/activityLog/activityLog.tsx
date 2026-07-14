import Header from "../../components/header/header";
import Sidebar from "../../components/sidebar/sidebar";

import "../adminShared/adminPages.css";

const activities = [
  {
    title: "Ny innlogging",
    description: "En bruker logget inn i administrasjonssystemet.",
    time: "I dag, 09:15",
    type: "success"
  },
  {
    title: "Brukerprofil oppdatert",
    description: "Sist pålogget og verifiseringsstatus ble synkronisert.",
    time: "I dag, 08:47",
    type: "info"
  },
  {
    title: "Venter på rolle",
    description: "En ny bruker mangler rolle før full tilgang kan gis.",
    time: "I går, 16:22",
    type: "warning"
  }
];

function ActivityLog() {
  return (
    <main className="admin-page">
      <Sidebar />

      <section className="admin-main">
        <Header title="Aktivitetslogg" />

        <div className="admin-body">
          <section className="admin-panel">
            <div className="admin-panel-header">
              <div>
                <h2>Aktivitetslogg</h2>
                <p>Siste hendelser i systemet.</p>
              </div>
            </div>

            <div className="admin-list">
              {activities.map((activity) => (
                <article key={`${activity.title}-${activity.time}`} className="admin-list-item">
                  <div>
                    <strong>{activity.title}</strong>
                    <p>{activity.description}</p>
                  </div>

                  <div>
                    <span className={`admin-badge ${activity.type === "success" ? "success" : activity.type === "warning" ? "warning" : ""}`}>
                      {activity.time}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

export default ActivityLog;
