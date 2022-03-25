import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import api from "../../Config/Api";
import { useState } from "react";
import { useEffect } from "react";
import { toastTrigger } from "../../helper/toast";

const LikeDislikeComment = ({
  commentId,
  commentLike,
  commentDislike,
  changeLikeComment,
  messageCommentLikeByCurrentUser,
}) => {
  const [pushLike, setPushLike] = useState(["far", "thumbs-up"]);
  const [pushDislike, setPushDislike] = useState(["far", "thumbs-down"]);

  useEffect(() => {
    if (messageCommentLikeByCurrentUser?.length) {
      if (messageCommentLikeByCurrentUser[0].userLike) {
        setPushLike(["fas", "thumbs-up"]);
      } else if (messageCommentLikeByCurrentUser[0].userDislike) {
        setPushDislike(["fas", "thumbs-down"]);
      }
    }
  }, [messageCommentLikeByCurrentUser]);

  const onLike = async () => {
    try {
      const token = JSON.parse(JSON.stringify(sessionStorage.getItem("groupomania-token")));

      const response = await api({
        url: "/" + commentId + "/vote/like",
        method: "post",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data === "like ajouté") {
        commentLike = commentLike + 1;
        setPushLike(["fas", "thumbs-up"]);
        toastTrigger("success", "Like ajouté 👍🏼");
      } else if (response.data === "like retiré") {
        commentLike = commentLike - 1;
        setPushLike(["far", "thumbs-up"]);
        toastTrigger("success", "Like supprimé 👍🏼");
      } else if (response.data === "dislike retiré, like ajouté") {
        commentLike = commentLike + 1;
        setPushLike(["fas", "thumbs-up"]);
        toastTrigger("success", "Like ajouté 👍🏼");
        commentDislike = commentDislike - 1;
        setPushDislike(["far", "thumbs-down"]);
      }
      changeLikeComment({ commentId, commentLike, commentDislike });
    } catch (error) {
      toastTrigger("error", "Une erreur est survenue ⛔️");
    }
  };

  const onDislike = async () => {
    try {
      const token = JSON.parse(JSON.stringify(sessionStorage.getItem("groupomania-token")));

      const response = await api({
        url: "/" + commentId + "/vote/dislike",
        method: "post",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data === "dislike ajouté") {
        commentDislike = commentDislike + 1;
        setPushDislike(["fas", "thumbs-down"]);
        toastTrigger("success", "Dislike ajouté 👎🏼");
      } else if (response.data === "dislike retiré") {
        commentDislike = commentDislike - 1;
        setPushDislike(["far", "thumbs-down"]);
        toastTrigger("success", "Dislike supprimé 👎🏼");
      } else if (response.data === "like retiré, dislike ajouté") {
        commentDislike = commentDislike + 1;
        setPushDislike(["fas", "thumbs-down"]);
        toastTrigger("success", "Dislike ajouté 👎🏼");
        commentLike = commentLike - 1;
        setPushLike(["far", "thumbs-up"]);
      }
      changeLikeComment({ commentId, commentLike, commentDislike });
    } catch (error) {
      toastTrigger("error", "Une erreur est survenue ⛔️");
    }
  };

  return (
    <div className="like-dislike-container">
      <div className="like-blue">
        <FontAwesomeIcon onClick={onLike} color="blue" icon={pushLike} />
        {commentLike}
      </div>
      <div className="like-icon">
        <FontAwesomeIcon onClick={onDislike} color="red" icon={pushDislike} />
        {commentDislike}
      </div>
    </div>
  );
};
export default LikeDislikeComment;
