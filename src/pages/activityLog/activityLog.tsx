import { useEffect, useState } from "react";

import Header from "../../components/header/header";
import Sidebar from "../../components/sidebar/sidebar";
import {
  ActivityLogEntry,
  getRecentActivities
} from "../../services/activityLogService";

import "./activityLog.css";

function formatDate(dateValue: any) {
  if (!dateValue) return "Nettopp";

  if (dateValue.toDate) {
    return dateValue.toDate().toLocaleDateString("no-NO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  return "Nettopp";
}

function ActivityLog() {
  const [activities, setActivities] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        setError("");
        setActivities(await getRecentActivities());
      } catch (error) {
        console.error("Kunne ikke hente aktivitetslogg:", error);
        setError("Kunne ikke hente aktivitetsloggen.");
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

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
                <p>Siste viktige hendelser i systemet.</p>
              </div>
            </div>

            {error && <p className="table-error">{error}</p>}

            <div className="admin-list">
              {loading ? (
                <p className="empty-list-state">Henter aktivitetslogg...</p>
              ) : activities.length === 0 ? (
                <p className="empty-list-state">Ingen hendelser enda.</p>
              ) : (
                activities.map((activity) => (
                  <article key={activity.id} className="admin-list-item">
                    <div>
                      <strong>{activity.title}</strong>
                      <p>{activity.description}</p>
                    </div>

                    <div>
                      <span className={`admin-badge ${activity.level}`}>
                        {formatDate(activity.createdAt)}
                      </span>
                    </div>
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

export default ActivityLog;
