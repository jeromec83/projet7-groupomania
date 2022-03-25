import Input from "../../components/Input/Input";
import InputTextArea from "../../components/Input/InputTextARea";
import Button from "../../components/Button/Button";
import api from "../../Config/Api";
import { useState } from "react";
import { useHistory } from "react-router";
import { toastTrigger } from "../../helper/toast";
import ErrorMessage from "../../components/ErrorMessage/ErrorMessage";
import "./register.css";

const Register = ({ /*setIsLoggedin*/ setMyUserId }) => {
  const history = useHistory();
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorEmail, setErrorEmail] = useState("");
  const [errorFirstname, setErrorFirstname] = useState("");
  const [errorLastname, setErrorLastname] = useState("");
  const [errorPassword, setErrorPassword] = useState("");
  const [errorConfirmPassword, setErrorConfirmPassword] = useState("");

  const name_regex = /^([A-zàâäçéèêëîïôùûüÿæœÀÂÄÇÉÈÊËÎÏÔÙÛÜŸÆŒ-]* ?[A-zàâäçéèêëîïôùûüÿæœÀÂÄÇÉÈÊËÎÏÔÙÛÜŸÆŒ]+$)$/;
  const email_regex =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  const password_regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,}$/;

  const onChangeFirstname = (e) => {
    setFirstname(e.target.value);
  };

  const onChangeLastname = (e) => {
    setLastname(e.target.value);
  };

  const onChangeBio = (e) => {
    setBio(e.target.value);
  };

  const onChangeEmail = (e) => {
    setEmail(e.target.value);
  };

  const onChangePassword = (e) => {
    setPassword(e.target.value);
  };

  const onChangeConfirmPassword = (e) => {
    setConfirmPassword(e.target.value);
  };

  const onRegister = async () => {
    if (!email_regex.test(email)) {
      setErrorEmail("votre e-mail doit se terminer par @groupomania.com");
      return;
    } else {
      setErrorEmail("");
    }

    if (!name_regex.test(firstname)) {
      setErrorFirstname("Prénom non valide");
      return;
    } else {
      setErrorFirstname("");
    }

    if (!name_regex.test(lastname)) {
      setErrorLastname("NOM non valide");
      return;
    } else {
      setErrorLastname("");
    }

    if (!password_regex.test(password)) {
      setErrorPassword(
        "mot de passe non valide, 8 caractères minimum, contenant au moins une lettre minuscule, une lettre majuscule, un chiffre numérique et un caractère spécial"
      );
      return;
    } else {
      setErrorPassword("");
    }

    if (password !== confirmPassword) {
      setErrorConfirmPassword("vous n'avez pas saisie le même mot de passe");
      return;
    } else {
      setErrorConfirmPassword("");
    }

    try {
      const response = await api.post("/users/registrer/", {
        firstname,
        lastname,
        bio,
        email,
        password,
        confirmPassword,
      });

      //sessionStorage.setItem("groupomania-token", response.data.token);
      //setIsLoggedin(true);

      setMyUserId(response.data.userId);
      toastTrigger("success", "Inscription réussie");
      //history.push("/accueil");
      history.push("/connexion");
    } catch (error) {
      toastTrigger("error", "Une erreur est survenue ⛔️");
    }
  };

  return (
    <div className="register-container">
      <div className="register-title">Rejoignez vos collaborateurs en vous inscrivant</div>
      <div className="register-input">
        <Input onChange={onChangeEmail} value={email} label="e-mail" />
      </div>
      {errorEmail && <ErrorMessage message={errorEmail} />}
      <div className="register-input">
        <Input onChange={onChangeFirstname} value={firstname} label="Prénom" />
      </div>
      {errorFirstname && <ErrorMessage message={errorFirstname} />}
      <div className="register-input">
        <Input onChange={onChangeLastname} value={lastname} label="NOM" />
      </div>
      {errorLastname && <ErrorMessage message={errorLastname} />}
      <div className="register-input">
        <Input onChange={onChangePassword} value={password} label="mot de passe" type="password" />
      </div>
      {errorPassword && <ErrorMessage message={errorPassword} />}
      <div className="register-input">
        <Input
          onChange={onChangeConfirmPassword}
          value={confirmPassword}
          label="confirmer mot de passe"
          type="password"
        />
      </div>
      {errorConfirmPassword && <ErrorMessage message={errorConfirmPassword} />}
      <div className="register-input">
        <InputTextArea rows={4} variant="outlined" label="Description" onChange={onChangeBio} value={bio} />
      </div>
      <div className="register-button">
        <Button onClick={onRegister} title="S'inscrire" />
      </div>
    </div>
  );
};
export default Register;
