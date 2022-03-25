import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import api from "../../Config/Api";
import { useState } from "react";
import ConfirmPopUp from "../ConfirmPopUp/ConfirmPopUp";
import { toastTrigger } from "../../helper/toast";
import { useHistory } from "react-router";

const DeleteComment = ({
  messageId,
  admin,
  commentId,
  myUserId,
  idUserComment,
  changeDeleteComment,
  setAllMessages,
  setMessagesOtherUser,
  locationState,
}) => {
  const [open, setOpen] = useState(false);
  const history = useHistory();
  const handleModal = () => {
    setOpen(!open);
  };

  const onDeleteComment = async () => {
    const token = JSON.parse(JSON.stringify(sessionStorage.getItem("groupomania-token")));
    try {
      await api({
        url: `/user/${messageId}/${commentId}`,
        method: "delete",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "multipart/from-data",
        },
      });
      toastTrigger("success", "Commentaire supprimé 👌🏼");
      changeDeleteComment(commentId);
    } catch (error) {
      toastTrigger("error", "Une erreur est survenue ⛔️");
    }
    if (history.location.pathname === "/accueil") {
      try {
        const response = await api({
          url: "/messages/",
          method: "get",
          headers: { Authorization: `Bearer ${token}` },
        });
        setAllMessages(response.data);
      } catch (error) {}
      return;
    }
    if (history.location.pathname === "/profil") {
      try {
        const response = await api({
          url: "/user/messages",
          method: "get",
          headers: { Authorization: `Bearer ${token}` },
        });
        setAllMessages(response.data);
      } catch (error) {}
      return;
    }
    if (history.location.pathname === "/utilisateur/profil") {
      try {
        const response = await api({
          url: locationState,
          method: "get",
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessagesOtherUser(response.data);
      } catch (error) {}
      return;
    }
  };

  return (
    <div>
      {(myUserId === idUserComment || admin === true) && (
        <div className="delete-icon" onClick={handleModal}>
          <FontAwesomeIcon color="red" icon={["far", "trash-alt"]} /> supprimer
        </div>
      )}
      <ConfirmPopUp
        open={open}
        confirmModalAction={onDeleteComment}
        handleModal={handleModal}
        buttonTitle1="Oui"
        buttonTitle2="Non"
        modalTitle="Voulez vous supprimer le commentaire ?"
      />
    </div>
  );
};
export default DeleteComment;
