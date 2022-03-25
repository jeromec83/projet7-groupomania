import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
import api from "../../Config/Api";
import { useState } from "react";
import { useHistory } from "react-router";
import { toastTrigger } from "../../helper/toast";
import ErrorMessage from "../../components/ErrorMessage/ErrorMessage";
import "./login.css";

const Login = ({ setIsLoggedin, setMyUserId /*setAdmin*/ }) => {
  const history = useHistory();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const onChangeEmail = (e) => {
    setEmail(e.target.value);
  };

  const onChangePassword = (e) => {
    setPassword(e.target.value);
  };

  const onLogin = async () => {
    let token;
    try {
      const response = await api.post("/users/login/", {
        email,
        password,
      });
      token = response.data.token;
      sessionStorage.setItem("groupomania-token", token);
      setIsLoggedin(true);
      setMyUserId(response.data.userId);
      toastTrigger("success", `Bonjour ${response.data.firstname} ✌🏼`);
      history.push({ pathname: "/accueil" });
    } catch (error) {
      toastTrigger("error", "Une erreur est survenue ⛔️");
      setErrorMessage("e-mail ou mot de passe invalide");
    }
  };
  return (
    <div className="login-container">
      <div className="login-title">Connectez-vous avec vos collaborateurs</div>
      <div className="login-input-email">
        <Input onChange={onChangeEmail} label="e-mail" type="email" />
      </div>
      <div className="login-input-password">
        <Input onChange={onChangePassword} label="mot de passe" type="password" />
      </div>
      <div className="login-button">
        <Button onClick={onLogin} title="Connexion" />
      </div>
      {errorMessage && <ErrorMessage message={errorMessage} />}
    </div>
  );
};

export default Login;
