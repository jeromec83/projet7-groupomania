import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import Input from "../../components/Input/Input";
import Button from "../Button/Button";
import ErrorMessage from "../ErrorMessage/ErrorMessage";

const ModifPasswordPopUp = ({
  open,
  handleModal,
  modalTitle,
  buttonTitle1,
  buttonTitle2,
  newContent,
  onChange,
  onUpdate,
  label,
  newContent2,
  onChange2,
  label2,
  error,
  errorConfirm,
}) => {
  return (
    <Dialog open={open} onClose={handleModal}>
      <div className="modif-pop-up-container">
        <div className="modif-pop-up-inputs-container">
          <div className="modif-pop-up-title">
            <DialogTitle>{modalTitle}</DialogTitle>
          </div>

          <div style={{ marginBottom: "10px" }}>
            <Input value={newContent} onChange={onChange} label={label} type="password" />
          </div>
          {error && <ErrorMessage message={error} />}
          <div>
            <Input value={newContent2} onChange={onChange2} label={label2} type="password" />
          </div>
          {errorConfirm && <ErrorMessage message={errorConfirm} />}
          <div className="modif-pop-up-buttons">
            <div className="button-save-modif">
              <Button title={buttonTitle1} onClick={onUpdate} />
            </div>
            <div>
              <Button title={buttonTitle2} onClick={handleModal} />
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
};
export default ModifPasswordPopUp;
