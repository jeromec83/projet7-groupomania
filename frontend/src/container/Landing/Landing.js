import Button from "../../components/Button/Button";
import React from "react";
import { useHistory } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./landing.css";



const Landing = ({ setIsLoggedin }) => {
  const history = useHistory();

  const goRegister = () => {
    history.push("/inscription");
  };

  const goLogin = () => {
    history.push("/connexion");
  };

  return (
    <div className="landing-container">
      <div className="landing-title">
        Notre entreprise, spécialisée dans la grande distribution, est en pleine expansion. Nous avons actuellement plus
        de 600 collaborateurs.
        <br />
        Ce site est fait pour vous rassembler!
      </div>
      <div className="landing-button-register">
        <Button onClick={goRegister}  title='Inscription' >
        < FontAwesomeIcon icon="sign-in-alt" />
        </Button>
      </div>
      <div className="landing-button-login">
        <Button onClick={goLogin} title="Connexion">
        < FontAwesomeIcon icon="plug" color="fffff"/>
        </Button>
      </div>
    </div>
  );
};
export default Landing;
