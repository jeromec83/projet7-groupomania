import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import api from "../../Config/Api";
import { useState } from "react";
import ConfirmPopUp from "../ConfirmPopUp/ConfirmPopUp";
import { toastTrigger } from "../../helper/toast";
import "./delete-message.css";

const DeleteMessage = ({ messageId, myUserId, idUserMessage, changeDeleteMessage, admin }) => {
  const [open, setOpen] = useState(false);

  const handleModal = () => {
    setOpen(!open);
  };

  const onDeleteMessage = async () => {
    const token = JSON.parse(JSON.stringify(sessionStorage.getItem("groupomania-token")));

    try {
      await api({
        url: "/messages/" + messageId,
        method: "delete",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "multipart/from-data",
        },
      });
      changeDeleteMessage(messageId);
      toastTrigger("success", "Publication supprimé 👌🏼");
    } catch (error) {
      toastTrigger("error", "Une erreur est survenue ⛔️");
    }
  };
  return (
    <div>
      {(myUserId === idUserMessage || admin === true) && (
        <div className="delete-icon" onClick={handleModal}>
          <FontAwesomeIcon color="red" icon={["far", "trash-alt"]} /> supprimer
        </div>
      )}
      <ConfirmPopUp
        open={open}
        confirmModalAction={onDeleteMessage}
        handleModal={handleModal}
        buttonTitle1="Oui"
        buttonTitle2="Non"
        modalTitle="Voulez vous supprimer la publication ?"
      />
    </div>
  );
};
export default DeleteMessage;
