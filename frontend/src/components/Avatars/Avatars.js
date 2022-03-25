import { useState } from "react";
import api from "../../Config/Api";
import "./avatars.css";

import Button from "../Button/Button";
import Dialog from "@material-ui/core/Dialog";

function importAll(r) {
  let images = {};
  r.keys().forEach((item, index) => {
    images[item.replace("./", "")] = r(item);
  });

  return images;
}


const images = importAll(require.context("../../assets/avatars", false, /\.(png|jpe?g|svg)$/));

const Card = ({ number, selectCardIndex }) => {
  return (
    <img
      style={selectCardIndex === number ? { border: "1px solid black" } : null}
      name={images[`${number}.jpg`].default}
      src={images[`${number}.jpg`].default}
      alt={number}
      height={150}
      width={150}
    />
  );
};

const Avatar = ({ onChangeAvatar, close, open, handleModal }) => {
  const [avatar, setAvatar] = useState("");
  const groupomaniaUser = JSON.parse(sessionStorage.getItem("groupomania-user"));

  const [selectCardIndex, setSelectCardIndex] = useState(null);
  const tab = Array.from(Array(11).keys());

  tab.shift();

  const onSubmitAvatar = (e, i) => {
    setAvatar(e.target.name);
    setSelectCardIndex(i + 1);
  };

  const onSubmit = async () => {
    try {
      const token = JSON.parse(JSON.stringify(sessionStorage.getItem("groupomania-token")));
      const response = await api({
        method: "put",
        url: "/users/profile/",
        data: { avatar },
        headers: { Authorization: `Bearer ${token}` },
      });
      let oldSessionStorage = groupomaniaUser;
      oldSessionStorage.avatar = response.data.avatar;
      sessionStorage.setItem("groupomania-user", JSON.stringify(oldSessionStorage));
      //setFirstname(response.data.firstname);
      onChangeAvatar(response.data.avatar);
      close();
    } catch (error) {}
  };

  return (
    <Dialog open={open} onClose={handleModal}>
      <div>
        <div className="avatar-choice-container">
          <div>
            {tab &&
              tab.map((element, i) => {
                return (
                  <div key={i} onClick={(e) => onSubmitAvatar(e, i)}>
                    <Card selectCardIndex={selectCardIndex} number={element} />
                  </div>
                );
              })}
          </div>
        </div>
        <div className="avatar-button">
          <Button onClick={onSubmit} title="Valider l'avatar" />
        </div>
      </div>
    </Dialog>
  );
};
export default Avatar;
