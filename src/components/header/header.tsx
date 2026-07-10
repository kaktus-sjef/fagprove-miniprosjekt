import "./header.css";
import { FaRegBell } from "react-icons/fa";
import { IoIosSearch } from "react-icons/io";
import { GoQuestion } from "react-icons/go";



interface HeaderProps {
    title: string;
}

function Header({ title }: HeaderProps) {
    return (
        <header className="header">

            <div className="header-left">
                <h1>{title}</h1>
                <p>Velkommen til administrasjonssenteret</p>
            </div>

            <div className="header-right">

                <div className="search-box">
                    {IoIosSearch({className: "icon"})}
                    <input
                        type="text"
                        placeholder="Søk..."
                    />
                </div>

                <button className="icon-button">
                    {FaRegBell({className: "icon"})}
                </button>

                <button className="icon-button">
                    {GoQuestion({className: "icon"})}
                </button>

                <div className="user-menu">

                    <div className="user-avatar">
                        A
                    </div>

                    <select>
                        <option>Administrator</option>
                        <option>Min profil</option>
                        <option>Logg ut</option>
                    </select>

                </div>

            </div>

        </header>
    );
}

export default Header;