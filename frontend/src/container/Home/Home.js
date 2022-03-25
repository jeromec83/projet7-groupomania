import React, { useState, useEffect } from "react";
import { useHistory } from "react-router";
import api from "../../Config/Api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PostMessage from "../../components/PostMessage/PostMessage";
import OutlinedChips from "../../components/CardAllUsers/CardAllUsers";
import LikeDislikeMessage from "../../components/LikeMessage/LikeMessage";
import CommentMessage from "../../components/CommentMessage/CommentMessage";
import DeleteMessage from "../../components/DeleteMessage/DeleteMessage";
import ModifyMessage from "../../components/ModifyMessage/ModifyMessage";
import moment from "moment";
import "./home.css";

const Home = ({ myUserId, admin, setAdmin }) => {
  const [allMessages, setAllMessages] = useState([]);
  // eslint-disable-next-line
  const [user, setUser] = useState({}); 

  const history = useHistory();
  const groupomaniaUser = JSON.parse(sessionStorage.getItem("groupomania-user"));

  useEffect(() => {
    if (sessionStorage.getItem("groupomania-token")) {
      const getMessages = async () => {
        const token = JSON.parse(JSON.stringify(sessionStorage.getItem("groupomania-token")));

        try {
          const response = await api({
            url: "/messages/",
            method: "get",
            headers: { Authorization: `Bearer ${token}` },
          });
          const userDataResponse = await api({
            url: "/users/profile/",
            method: "get",
            headers: { Authorization: `Bearer ${token}` },
          });
          setAdmin(userDataResponse.data.isAdmin);
          setUser(userDataResponse.data);
          sessionStorage.setItem("groupomania-user", JSON.stringify(userDataResponse.data));
          setAllMessages(response.data);
        } catch (error) {}
      };
      getMessages();
    } else {
      history.push("/");
    }
  }, [history, setAdmin]);
  // rendre dynamique l'affichage des messages
  const viewMessagesPost = (newMessages) => {
    setAllMessages(newMessages);
  };

  // rendre dynamique l'affichage des likes message
  const changeLike = ({ messageId, like, dislike }) => {
    const displayLike = allMessages.filter((element) => {
      if (element.id === messageId) {
        element.likes = like;
        element.dislikes = dislike;
      }
      return element;
    });
    setAllMessages(displayLike);
  };

  // rendre dynamique l'affichage des commentaires
  const changeComment = ({ messageId, comments }) => {
    const displayComment = allMessages.filter((element) => {
      if (element.id === messageId) {
        element.comments = comments;
      }
      return element;
    });
    setAllMessages(displayComment);
  };
  // rendre dynamique la suppression de message
  const changeDeleteMessage = (messageId) => {
    const idToDelete = messageId;
    const displayMessages = allMessages.filter((element) => element.id !== idToDelete);
    setAllMessages(displayMessages);
  };

  const goToOtherProfil = (id) => {
    if (id === myUserId) {
      history.push("/profil");
    } else {
      history.push({ pathname: "/utilisateur/profil", state: { id } });
    }
  };

  return (
    <main className="grpm-home">
      <div className="post-message-container">
        <PostMessage viewMessagesPost={viewMessagesPost} />
      </div>
      <div className="search-user-container">
        <OutlinedChips myUserId={myUserId} />
      </div>
      <div className="message-card-container">
        <div style={{ display: "none" }}>
          <h1>Dernières publications</h1>
        </div>
        {allMessages.map((element) => {
          const messageLikeByCurrentUser = element?.Likes?.filter((elt) => groupomaniaUser.id === elt.userId);
          const firstnameLastname = element.User.firstname + " " + element.User.lastname;
          return (
            <div className="message-card" key={element.id}>
              <div className="avatar-name" onClick={() => goToOtherProfil(element.UserId)}>
                <div className="avatar-picture">
                  <img width="100%" height="100%" alt="" style={{ borderRadius: "50%" }} src={element.User.avatar} />
                </div>
                <div>{firstnameLastname}</div>
              </div>
              <div className="message-is-admin">
                {element.User.isAdmin && <FontAwesomeIcon color="#fc930c" icon={["fas", "user-cog"]} />}{" "}
                {element.User.isAdmin && "Administrateur"}
              </div>
              <div className="message-date">Publiée {moment(new Date(element.createdAt)).fromNow()}</div>
              {element.createdAt !== element.updatedAt && (
                <div className="message-date">Modifiée {moment(new Date(element.updatedAt)).fromNow()}</div>
              )}

              <div className="message-container">
                <div className="message-title">{element.title}</div>
                {element.attachment && (
                  <div className="picture-container">
                    <img src={element.attachment} alt="" width="100%" height="100%" />
                  </div>
                )}
                <div className="message-content">{element.content}</div>
              </div>
              <div className="message-like-dislike">
                <LikeDislikeMessage
                  changeLike={changeLike}
                  like={element.likes}
                  dislike={element.dislikes}
                  messageId={element.id}
                  messageLikeByCurrentUser={messageLikeByCurrentUser}
                />
              </div>
              <div className="message-comment">
                <CommentMessage
                  admin={admin}
                  setAllMessages={setAllMessages}
                  changeComment={changeComment}
                  comments={element.comments}
                  messageId={element.id}
                  myUserId={myUserId}
                />
              </div>

              <div className="message-modify">
                <ModifyMessage
                  admin={admin}
                  messageId={element.id}
                  title={element.title}
                  oldAttachement={element.attachment}
                  attachment={element.attachment}
                  content={element.content}
                  myUserId={myUserId}
                  idUserMessage={element.UserId}
                  setAllMessages={setAllMessages}
                  getMessagesURI="/messages"
                />
              </div>

              <div className="message-delete">
                <DeleteMessage
                  admin={admin}
                  changeDeleteMessage={changeDeleteMessage}
                  messageId={element.id}
                  myUserId={myUserId}
                  idUserMessage={element.UserId}
                />
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
};
export default Home;
