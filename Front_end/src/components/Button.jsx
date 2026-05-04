import React from 'react';
import './Button.css';

const Button = ({ children, variant = 'primary', icon, onClick, className = '' }) => {
  return (
    <button className={`btn btn-${variant} ${className}`} onClick={onClick}>
      {icon && <span className="btn-icon">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;