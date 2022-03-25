import logo_1 from "../../assets/logo_3 copie.png";
import Button from "../Button/Button";
import { useState } from "react";
import { useHistory } from "react-router";
import "./header.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Header = ({ isLoggedin, setIsLoggedin }) => {
  const history = useHistory();
  const [isLogPage, setIsLogPage] = useState(false);

  const onLogout = () => {
    setIsLoggedin(false);
    sessionStorage.removeItem("groupomania-token");
    sessionStorage.removeItem("groupomania-user");
    history.push("/");
  };

  history.listen((location) => {
    setIsLogPage(location.pathname === "/connexion" || location.pathname === "/inscription");
  });

  return (
    <header className="grpm-header">
      <div className="grpm-logo_1">
        <img className="img-logo-1" src={logo_1} onClick={() => history.push("/accueil")} alt="logo groupomania" />
      </div>

      {isLoggedin && (
        <div className="grpm-buttons-log-1">
          <div className="grpm-buttons-log-2">
            <Button style={{ marginRight: "20px" }} onClick={() => history.push("/accueil")} title="Accueil">
              <FontAwesomeIcon  icon={["fas", "home"]} />
            </Button>
            <Button style={{ marginRight: "20px" }} onClick={() => history.push("/profil")} title="Profil">
              <FontAwesomeIcon  icon={["fas", "user-circle"]} />
            </Button>
            <Button style={{ marginRight: "20px" }} title="Déconnexion" onClick={onLogout}>
              <FontAwesomeIcon  icon={["fas", "stop-circle"]} />
            </Button>
          </div>
          <div className="grpm-buttons-log-3">
            <Button style={{ marginRight: "20px" }} onClick={() => history.push("/accueil")}>
              <FontAwesomeIcon  icon={["fas", "home"]} />
            </Button>
            <Button style={{ marginRight: "20px" }} onClick={() => history.push("/profil")}>
              <FontAwesomeIcon  icon={["fas", "user-circle"]} />
            </Button>
            <Button style={{ marginRight: "20px" }} onClick={onLogout}>
              <FontAwesomeIcon icon={["fas", "stop-circle"]} />
            </Button>
          </div>
        </div>
      )}

      {isLogPage && (
        <div className="grpm-button-back">
          <Button onClick={() => history.goBack()} title="Retour">
            <FontAwesomeIcon color="white" icon={["fas", "arrow-alt-circle-left"]} />
          </Button>
        </div>
      )}
    </header>
  );
};

export default Header;
