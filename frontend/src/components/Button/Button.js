import "./button.css";

const Button = ({ title, onClick, children, style }) => {
  return (
    <div className="button" style={style} onClick={onClick}>
      <div className="icon-button">{children}</div>
      <div>{title}</div>
    </div>
  );
};

export default Button;
