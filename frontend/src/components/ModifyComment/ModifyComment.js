import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import api from "../../Config/Api";
import { useState } from "react";
import ModifCommentPopUp from "../ModifCommentPopUp/ModifCommentPopUP";
import { toastTrigger } from "../../helper/toast";

const ModifyComment = ({ myUserId, idUserComment, commentId, content, messageId, setAllComments }) => {
  const [open, setOpen] = useState(false);
  const [newContent, setNewContent] = useState(content);

  const handleModal = () => {
    setOpen(!open);
  };
  const onUpdate = async () => {
    const token = JSON.parse(JSON.stringify(sessionStorage.getItem("groupomania-token")));
    const obj = { content: newContent };
    if (content === newContent || newContent === "") {
      toastTrigger("error", "Le commentaire n'a pas été modifié");
      setOpen(false);
      return;
    }
    try {
      await api({
        url: commentId + "/comment/update",
        method: "put",
        data: obj,
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      setOpen(false);
      try {
        const response = await api({
          url: "/" + messageId + "/comments",
          method: "get",
          headers: { Authorization: `Bearer ${token}` },
        });
        setAllComments(response.data);
        toastTrigger("success", "Commentaire modifié 👌🏼");
      } catch (error) {}
    } catch (error) {
      toastTrigger("error", "Une erreur est survenue ⛔️");
    }
  };
  const onChangeContent = (e) => {
    setNewContent(e.target.value);
  };

  return (
    <div>
      {myUserId === idUserComment && (
        <div className="modify-icon" onClick={handleModal}>
          <FontAwesomeIcon color="blue" icon={["far", "edit"]} /> modifier
        </div>
      )}
      <ModifCommentPopUp
        open={open}
        onChange={onChangeContent}
        handleModal={handleModal}
        onUpdate={onUpdate}
        modalTitle="Modifier votre commentaire"
        buttonTitle1="Sauvegarder Modifications"
        buttonTitle2="Annuler Modifications"
        newContent={newContent}
        setNewContent={setNewContent}
        label="Modifier commentaire"
      />
    </div>
  );
};
export default ModifyComment;
