/**
 * UiPortal - React Portal wrapper for rendering modals and toasts outside the normal DOM hierarchy.
 * Ensures proper z-index layering and accessibility for overlay components.
 */
import React, { createPortal } from 'react';

const UiPortal = ({ children, containerId = 'portal-root' }) => {
  const container = document.getElementById(containerId) || document.body;
  
  return createPortal(children, container);
};

export default UiPortal;
