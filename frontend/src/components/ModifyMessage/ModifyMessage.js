import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import api from "../../Config/Api";
import { useState } from "react";
import ModifPopUp from "../ModifPopUp/ModifPopUp";
import FormData from "form-data";
import { toastTrigger } from "../../helper/toast";
import "./modify-message.css";

const ModifyMessage = ({
  messagesOtherUser,
  admin,
  myUserId,
  idUserMessage,
  messageId,
  title,
  content,
  attachment,
  oldAttachement,
  setAllMessages,
  setMessagesOtherUser,
  getMessagesURI,
}) => {
  const [open, setOpen] = useState(false);
  const [newFile, setNewFile] = useState(attachment);
  const [fileToSend, setFileToSend] = useState("");
  const [newTitle, setNewTitle] = useState(title);
  const [newContent, setNewContent] = useState(content);

  const handleModal = () => {
    setOpen(!open);
    setNewFile(oldAttachement);
  };

  const onUpdate = async () => {
    const token = JSON.parse(JSON.stringify(sessionStorage.getItem("groupomania-token")));
    const obj = { title: newTitle, content: newContent };
    const json = JSON.stringify(obj);
    const formData = new FormData();
    formData.append("image", fileToSend);
    formData.append("message", json);
    if ((title === newTitle && content === newContent && newFile === oldAttachement) || newTitle === "") {
      toastTrigger("error", "Rien n'a été modifié");
      setOpen(false);
      return;
    }

    if (!newFile && newContent === "") {
      toastTrigger("error", "Rien n'a été modifié");
      setNewContent(content);
      setOpen(false);
      return;
    }

    try {
      await api({
        url: messageId + "/update",
        method: "put",
        data: formData,
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "multipart/from-data",
        },
      });
      setOpen(false);
      toastTrigger("success", "Publication modifié 👌🏼");
      try {
        const response = await api({
          url: getMessagesURI,
          method: "get",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (messagesOtherUser) {
          setMessagesOtherUser(response.data);
        } else {
          setAllMessages(response.data);
        }
      } catch (error) {
        toastTrigger("error", "Une erreur est survenue ⛔️");
      }
    } catch (error) {
      toastTrigger("error", "Une erreur est survenue ⛔️");
    }
  };
  return (
    <div>
      {(myUserId === idUserMessage || admin === true) && (
        <div className="modify-icon" onClick={handleModal}>
          <FontAwesomeIcon color="blue" icon={["far", "edit"]} /> modifier
        </div>
      )}
      <ModifPopUp
        oldAttachement={oldAttachement}
        open={open}
        handleModal={handleModal}
        modalTitle="Modifier la publication"
        buttonTitle1="Sauvegarder Modifications"
        buttonTitle2="Annuler Modifications"
        onUpdate={onUpdate}
        newTitle={newTitle}
        newContent={newContent}
        newFile={newFile}
        setNewFile={setNewFile}
        setFileToSend={setFileToSend}
        setNewTitle={setNewTitle}
        setNewContent={setNewContent}
        attachment={attachment}
      />
    </div>
  );
};
export default ModifyMessage;
