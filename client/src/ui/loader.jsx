// Pure JavaScript Spinner — replaces Chakra <Spinner />
export const Loader = ({ size = 20, border = 3 }) => {
  const style = {
    width: size,
    height: size,
    border: `${border}px solid #e5e7eb`,
    borderTop: `${border}px solid #3b82f6`,
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
    display: "inline-block",
  };

  return (
    <span style={style} role="status" aria-label="loading">
      <style>
        {`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}
      </style>
    </span>
  );
};



export const Spinner = ({ size = 24, thickness = 4, color = "#3b82f6" }) => {
  const borderStyle = `${thickness}px solid #e5e7eb`; // Tailwind gray-200
  const borderTopStyle = `${thickness}px solid ${color}`; // Tailwind blue-500 or custom color

  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        border: borderStyle,
        borderTop: borderTopStyle,
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
      }}
      role="status"
      aria-label="loading"
    >
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

