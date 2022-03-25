import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import Button from "../Button/Button";
import "./confirm-pop-up.css";

const ConfirmPopUp = ({ open, confirmModalAction, handleModal, buttonTitle1, buttonTitle2, modalTitle }) => {
  return (
    <Dialog open={open} onClose={handleModal}>
      <div className="confirm-container">
        <div className="confirm-title">
          <DialogTitle>{modalTitle}</DialogTitle>
        </div>
        <div className="confirm-buttons-container">
          <div className="confirm-button-yes">
            <Button title={buttonTitle1} onClick={confirmModalAction} />
          </div>
          <div>
            <Button title={buttonTitle2} onClick={handleModal} />
          </div>
        </div>
      </div>
    </Dialog>
  );
};
export default ConfirmPopUp;
