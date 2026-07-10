import Sidebar from "../../components/sidebar/sidebar";
import Header from "../../components/header/header";
import "./dashboard.css";
import { FaLongArrowAltUp, FaLongArrowAltDown, FaUsers, } from "react-icons/fa";
import { FaUserCheck, FaUserMinus } from "react-icons/fa6";

function Dashboard() {
    return (
        <>
            <main className="dashboard-content">
                <Sidebar />
                <section className="dashboard-section">
                    <Header title="Oversikt" />
                    <section className="dashboard-analytics">
                        <div className="analytics-card">
                            <div>
                                <div className="icon-box">{FaUsers({className: "icon"})}</div>
                            </div>
                            <div>
                                <ul className="analytics-list">
                                    <li>Totale Brukere</li>
                                    <li><h3>100</h3></li>
                                    <li className="analytics-change">
                                        {FaLongArrowAltUp({className: "icon"})}
                                        10%
                                        <p>Denne måneden</p>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="analytics-card">
                            <div>
                                <div className="icon-box">{FaUserCheck({className: "icon"})}</div>
                            </div>
                            <div>
                                <ul className="analytics-list">
                                    <li>Aktive Brukere</li>
                                    <li><h3>80</h3></li>
                                    <li className="analytics-change">
                                        {FaLongArrowAltDown({className: "icon"})}
                                        5%
                                        <p>Denne måneden</p>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="analytics-card">
                            <div>
                                <div className="icon-box">{FaUserMinus({className: "icon"})}</div>
                            </div>
                            <div>
                                <ul className="analytics-list">
                                    <li>Inaktive Brukere</li>
                                    <li><h3>120</h3></li>
                                    <li className="analytics-change">
                                        {FaLongArrowAltUp({className: "icon"})}
                                        15%
                                        <p>Denne måneden</p>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </section>
                </section>
            </main>
        </>
    );
}

export default Dashboard;