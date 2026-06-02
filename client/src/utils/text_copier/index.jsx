import { useState } from "react";
import { useManageToaster } from "../toaster";
// import { Copy } from "lucide-react";


const useTextCopier = () => {
  const [copied, setCopied] = useState(false);
  const { manageToaster } = useManageToaster();

  const handleCopy = async (reference) => {
    if (!reference) return;
    await navigator.clipboard.writeText(reference);
    setCopied(true);
    manageToaster("Text is copied", "info", "Clipboard", 1000, false);
    setTimeout(() => setCopied(false), 2500);
  };

  const ShowCopiedComponent = ({ color, intensity = 300 }) => {
    const text_color =
      color === "white" || color === "black"
        ? `text-${color}`
        : color
        ? `text-${color}-${intensity}`
        : "text-black";

    return (
      <>
        {copied && (
          <span className={` ${text_color} text-xs ml-2`}>Copied!</span>
        )}
      </>
    );
  };

  return {
    handleCopy,
    ShowCopiedComponent,
  };
};

export { useTextCopier };
