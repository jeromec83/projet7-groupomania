import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import Login from "../../container/Login/Login";
import Register from "../../container/Register/Register";
import Home from "../../container/Home/Home";
import Landing from "../../container/Landing/Landing";
import UserProfil from "../../container/UserProfil/UserProfil";
import OtherProfil from "../../container/OtherProfil/OtherProfil";
import PrivateRoute from "../PrivateRoute/PrivateRoute";
import api from "../../Config/Api";
import "../../assets/fontawesome";
import { ToastContainer } from "react-toastify";
import "./app.css";
import "moment/locale/fr";

const App = () => {
  const [isLoggedin, setIsLoggedin] = useState(false);
  const [checkLogin, setCheckLogin] = useState(false);
  const [myUserId, setMyUserId] = useState("");
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    const token = JSON.parse(JSON.stringify(sessionStorage.getItem("groupomania-token")));

    if (!isLoggedin && token) {
      const getUser = async () => {
        try {
          const response = await api({
            url: "/users/profile/",
            method: "get",
            headers: { Authorization: `Bearer ${token}` },
          });
          setMyUserId(response.data.id);
          setAdmin(response.data.isAdmin);
          setIsLoggedin(true);
          setCheckLogin(true);
        } catch (error) {
          setCheckLogin(true);
        }
      };
      getUser();
    } else {
      setCheckLogin(true);
    }
  }, [isLoggedin]);

  return (
    <Router>
      <Header isLoggedin={isLoggedin} setIsLoggedin={setIsLoggedin} />
      <div className="main-container">
        <Switch>
          {checkLogin && (
            <PrivateRoute
              exact
              path="/accueil"
              myUserId={myUserId}
              admin={admin}
              component={Home}
              isLoggedin={isLoggedin}
              setAdmin={setAdmin}
            />
          )}
          {checkLogin && (
            <PrivateRoute
              exact
              path="/profil"
              myUserId={myUserId}
              admin={admin}
              component={UserProfil}
              setIsLoggedin={setIsLoggedin}
              isLoggedin={isLoggedin}
              setCheckLogin={setCheckLogin}
            />
          )}
          {checkLogin && (
            <PrivateRoute
              exact
              path="/utilisateur/profil"
              myUserId={myUserId}
              admin={admin}
              component={OtherProfil}
              setIsLoggedin={setIsLoggedin}
              isLoggedin={isLoggedin}
              setCheckLogin={setCheckLogin}
            />
          )}
          <Route
            exact
            path="/"
            render={() =>
              isLoggedin ? (
                <Redirect to="/accueil" />
              ) : (
                <Landing setIsLoggedin={setIsLoggedin} isLoggedin={isLoggedin} />
              )
            }
          ></Route>
          <Route
            exact
            path="/connexion"
            render={() =>
              isLoggedin ? (
                <Redirect to="/accueil" />
              ) : (
                <Login
                  setMyUserId={setMyUserId}
                  setAdmin={setAdmin}
                  setIsLoggedin={setIsLoggedin}
                  isLoggedin={isLoggedin}
                />
              )
            }
          ></Route>
          <Route
            exact
            path="/inscription"
            render={() =>
              isLoggedin ? (
                <Redirect to="/accueil" />
              ) : (
                <Register setIsLoggedin={setIsLoggedin} isLoggedin={isLoggedin} setMyUserId={setMyUserId} />
              )
            }
          ></Route>
        </Switch>
      </div>
      <Footer />
      <ToastContainer />
    </Router>
  );
};

export default App;
