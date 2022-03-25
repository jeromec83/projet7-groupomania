import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const toastTrigger = (status, message) => {
  switch (status) {
    case "error":
      return toast.error(message, {
        autoClose: 2000,
      });
    case "success":
      return toast.success(message, {
        autoClose: 2000,
      });

    default:
      return null;
  }
};
