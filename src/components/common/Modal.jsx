import { useEffect, useRef } from "react";

function Modal({ isOpen, title, children, onClose }) {
  const modalRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    const focusFirstElement = () => {
      const preferredSelector = "input, select, textarea";
      const fallbackSelector =
        'button, [href], [tabindex]:not([tabindex="-1"])';
      const focusTarget =
        modalRef.current?.querySelector(preferredSelector) ||
        modalRef.current?.querySelector(fallbackSelector);
      if (focusTarget) {
        focusTarget.focus();
      }
    };

    const focusFrame = requestAnimationFrame(focusFirstElement);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      cancelAnimationFrame(focusFrame);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={title || "Dialog"}
        onClick={(event) => event.stopPropagation()}
        ref={modalRef}
      >
        <div className="modal-header">
          {title ? <h2>{title}</h2> : <span />}
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close dialog"
          >
            X
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

export default Modal;
