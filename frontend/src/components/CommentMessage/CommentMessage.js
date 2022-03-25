import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
import Accordion from "../Accordion/Accordion";
import api from "../../Config/Api";
import { useState } from "react";
import { useEffect } from "react";
import { toastTrigger } from "../../helper/toast";
import "./commentMessage.css";

const CommentMessage = ({
  messageId,
  admin,
  comments,
  changeComment,
  myUserId,
  setAllMessages,
  setMessagesOtherUser,
  locationState,
}) => {
  const [allComments, setAllComments] = useState([]);
  const [commentIcon, setCommentIcon] = useState(["far", "comment-dots"]);
  const [content, setContent] = useState("");
  const [limitContent, setLimitContent] = useState(0);
  const [activeLimitContent, setActiveLimitContent] = useState(false);
  const [caractere, setCaractere] = useState("caractères");

  useEffect(() => {
    if (comments > 0) {
      setCommentIcon(["fas", "comment-dots"]);
    }
  }, [comments]);

  const onChangeContent = (e) => {
    setContent(e.target.value);
    let limitNumberContent = e.target.value.length;

    if (limitNumberContent > 1500) {
      let errorLimit = limitNumberContent - 1500;

      setLimitContent(errorLimit);
      setActiveLimitContent(true);
    } else {
      setLimitContent(0);
      setActiveLimitContent(false);
    }
    if (limitContent > 0) {
      setCaractere("caractères");
    } else {
      setCaractere("caractère");
    }
  };

  const onComment = async () => {
    if (!content) {
      toastTrigger("error", "Une erreur est survenue ⛔️");
      return;
    }

    if (activeLimitContent) {
      toastTrigger("error", "Une erreur est survenue ⛔️");
      return;
    }
    const token = JSON.parse(JSON.stringify(sessionStorage.getItem("groupomania-token")));
    const obj = { content };
    // eslint-disable-next-line
    const user = JSON.parse(sessionStorage.getItem("groupomania-user"));// eslint-disable-line no-use-before-define
    try {
      const response = await api({
        url: "/" + messageId + "/comments/new/",
        method: "post",
        data: obj,
        headers: { Authorization: `Bearer ${token}` },
      });

      comments = response.data.comments;
      setCommentIcon(["fas", "comment-dots"]);

      changeComment({ messageId, comments });
      try {
        const response = await api({
          url: "/" + messageId + "/comments",
          method: "get",
          headers: { Authorization: `Bearer ${token}` },
        });
        setAllComments(response.data);
        setContent("");
        toastTrigger("success", "Commentaire ajouté 👌🏼");
      } catch (error) {}
    } catch (error) {
      toastTrigger("error", "Une erreur est survenue ⛔️");
    }
  };
  return (
    <div>
      <div className="comment-icon">
        <FontAwesomeIcon color="blue" icon={commentIcon} />
        {comments}
      </div>
      <div className="accordions">
        <Accordion
          admin={admin}
          setAllMessages={setAllMessages}
          title="afficher commentaires"
          content={content}
          messageId={messageId}
          allComments={allComments}
          setAllComments={setAllComments}
          myUserId={myUserId}
          setMessagesOtherUser={setMessagesOtherUser}
          locationState={locationState}
        />
      </div>
      <div className="comment-input-button">
        <div className="comment-input">
          <Input value={content} onChange={onChangeContent} label="votre commentaire" type="text" />
          {activeLimitContent && (
            <div style={{ color: "red" }}>vous avez {`${limitContent + " " + caractere}`} de trop</div>
          )}
        </div>
        <div className="comment-button">
          <Button onClick={onComment} title="commenter" />
        </div>
      </div>
    </div>
  );
};
export default CommentMessage;
