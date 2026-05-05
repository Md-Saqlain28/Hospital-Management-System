import React from 'react';
import './Button.css';

const Button = ({ children, variant = 'primary', icon, onClick, className = '', ...props }) => {
  return (
    <button className={`btn btn-${variant} ${className}`} onClick={onClick} {...props}>
      {icon && <span className="btn-icon">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;