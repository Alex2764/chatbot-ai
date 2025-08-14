/**
 * ConfirmDialog - Modal confirmation dialog for user actions that have side effects.
 * Uses UiPortal for proper rendering and provides confirm/cancel options.
 */
import React from 'react';
import UiPortal from './UiPortal';

const ConfirmDialog = ({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  confirmText = 'Confirm', 
  cancelText = 'Cancel' 
}) => {
  if (!isOpen) return null;

  return (
    <UiPortal>
      <div className="confirm-dialog-overlay">
        <div className="confirm-dialog">
          <h3 className="confirm-dialog-title">{title}</h3>
          <p className="confirm-dialog-message">{message}</p>
          <div className="confirm-dialog-actions">
            <button 
              className="btn btn-secondary" 
              onClick={onCancel}
            >
              {cancelText}
            </button>
            <button 
              className="btn btn-primary" 
              onClick={onConfirm}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </UiPortal>
  );
};

export default ConfirmDialog;
