import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import Input from "../../components/Input/Input";
import InputTextArea from "../../components/Input/InputTextARea";
import Button from "../Button/Button";
import "./modif-pop-up.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const ModifPopUp = ({
  open,
  handleModal,
  modalTitle,
  buttonTitle1,
  buttonTitle2,
  newTitle,
  newContent,
  newFile,
  setNewFile,
  setNewTitle,
  setNewContent,
  attachment,
  onUpdate,
  oldAttachement,
  setFileToSend,
}) => {
  const onUploadFile = (e) => {
    if (e.target.files[0]) {
      setNewFile(URL.createObjectURL(e.target.files[0]));
      setFileToSend(e.target.files[0]);
    } else {
      setNewFile(oldAttachement);
      setFileToSend("");
    }
  };

  const onChangeTitle = (e) => {
    setNewTitle(e.target.value);
  };

  const onChangeContent = (e) => {
    setNewContent(e.target.value);
  };

  return (
    <Dialog open={open} onClose={handleModal}>
      <div className="modif-pop-up-container">
        <div className="modif-pop-up-inputs-container">
          <div className="modif-pop-up-title">
            <DialogTitle>{modalTitle}</DialogTitle>
          </div>
          <div className="modif-pop-up-input-title">
            <Input value={newTitle} onChange={onChangeTitle} label="Titre" type="text" />
            {attachment ? (
              <div style={{ width: "90%" }} className="modif-pop-up-picture">
                <img src={newFile} alt="img" style={{ width: "100%", height: "100%" }} />
              </div>
            ) : (
              <div></div>
            )}
          </div>
          <div className="modif-pop-up-input-file">
            <div className="modif-pop-up-icon-picture">
              <FontAwesomeIcon color="#fc930c" icon={["fas", "camera-retro"]} />
            </div>
            <Input onChange={onUploadFile} type="file" />
          </div>
          <div>
            <InputTextArea
              value={newContent}
              onChange={onChangeContent}
              label="Publication"
              rows={4}
              variant="outlined"
            />
          </div>
        </div>
        <div className="modif-pop-up-buttons">
          <div className="button-save-modif">
            <Button title={buttonTitle1} onClick={onUpdate} />
          </div>
          <div>
            <Button title={buttonTitle2} onClick={handleModal} />
          </div>
        </div>
      </div>
    </Dialog>
  );
};
export default ModifPopUp;
