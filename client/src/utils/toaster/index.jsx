import { useToast } from "../../context/useToasterContext";


// toaster.jsx
const useManageToaster = () => {
  const toaster = useToast(); // correct: this IS the toast trigger

  const manageToaster = (
    message = "Something untracked happened",
    status = "info",
    description = null,
    duration = 3000,
    isClosable = true,
    direction = "top-right"
  ) => {
    // console.log("toaster");
    toaster({
      title: message,
      status: status,
      description: description,
      duration: duration,
      isClosable: isClosable,
      position: direction,
    });
  };

  return { manageToaster };
};

export { useManageToaster };
