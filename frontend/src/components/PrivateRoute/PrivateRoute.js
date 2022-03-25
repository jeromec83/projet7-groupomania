import { Route, Redirect } from "react-router-dom";

const PrivateRoute = ({
  component: Component,
  isLoggedin,
  setIsLoggedin,
  myUserId,
  setCheckLogin,
  admin,
  setAdmin,
  ...rest
}) => {
  return (
    <Route
      {...rest}
      render={(props) =>
        isLoggedin ? (
          <Component
            myUserId={myUserId}
            admin={admin}
            setAdmin={setAdmin}
            setIsLoggedin={setIsLoggedin}
            setCheckLogin={setCheckLogin}
            {...props}
          />
        ) : (
          <Redirect to={{ pathname: "/" }} />
        )
      }
    ></Route>
  );
};
export default PrivateRoute;
