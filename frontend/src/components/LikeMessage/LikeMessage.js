import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import api from "../../Config/Api";
import { useState } from "react";
import { useEffect } from "react";
import { toastTrigger } from "../../helper/toast";
import "./likemessage.css";

const LikeDislikeMessage = ({ messageId, like, dislike, changeLike, messageLikeByCurrentUser }) => {
  const [pushLike, setPushLike] = useState(["far", "thumbs-up"]);
  const [pushDislike, setPushDislike] = useState(["far", "thumbs-down"]);

  useEffect(() => {
    if (messageLikeByCurrentUser?.length) {
      if (messageLikeByCurrentUser[0].userLike) {
        setPushLike(["fas", "thumbs-up"]);
      } else if (messageLikeByCurrentUser[0].userDislike) {
        setPushDislike(["fas", "thumbs-down"]);
      }
    }
  }, [messageLikeByCurrentUser]);

  const onLike = async () => {
    try {
      const token = JSON.parse(JSON.stringify(sessionStorage.getItem("groupomania-token")));

      const response = await api({
        url: "/messages/" + messageId + "/vote/like",
        method: "post",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data === "like ajouté") {
        like = like + 1;
        setPushLike(["fas", "thumbs-up"]);
        toastTrigger("success", "Like ajouté 👍🏼");
      } else if (response.data === "like retiré") {
        like = like - 1;
        setPushLike(["far", "thumbs-up"]);
        toastTrigger("success", "Like supprimé 👍🏼");
      } else if (response.data === "dislike retiré, like ajouté") {
        like = like + 1;
        toastTrigger("success", "Like ajouté 👍🏼");
        setPushLike(["fas", "thumbs-up"]);
        dislike = dislike - 1;
        setPushDislike(["far", "thumbs-down"]);
      }
      changeLike({ messageId, like, dislike });
    } catch (error) {}
  };

  const onDislike = async () => {
    try {
      const token = JSON.parse(JSON.stringify(sessionStorage.getItem("groupomania-token")));

      const response = await api({
        url: "/messages/" + messageId + "/vote/dislike",
        method: "post",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data === "dislike ajouté") {
        dislike = dislike + 1;
        setPushDislike(["fas", "thumbs-down"]);
        toastTrigger("success", "Dislike ajouté 👎🏼");
      } else if (response.data === "dislike retiré") {
        dislike = dislike - 1;
        setPushDislike(["far", "thumbs-down"]);
        toastTrigger("success", "Dislike supprimé 👎🏼");
      } else if (response.data === "like retiré, dislike ajouté") {
        dislike = dislike + 1;
        setPushDislike(["fas", "thumbs-down"]);
        toastTrigger("success", "Dislike ajouté 👎🏼");
        like = like - 1;
        setPushLike(["far", "thumbs-up"]);
      }
      changeLike({ messageId, like, dislike });
    } catch (error) {}
  };

  return (
    <div className="like-dislike-container">
      <div className="like-blue">
        <FontAwesomeIcon onClick={onLike} color="blue" icon={pushLike} /> {like}
      </div>
      <div className="like-icon">
        <FontAwesomeIcon onClick={onDislike} color="red" icon={pushDislike} /> {dislike}
      </div>
    </div>
  );
};
export default LikeDislikeMessage;
