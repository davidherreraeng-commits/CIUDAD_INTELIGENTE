import { useCallback } from "react";
import Swal from "sweetalert2";

export function useErrorAlert () {
  const errorAlert = useCallback((title, err) => {
    Swal.fire({
      icon: "error",
      title,
      text: err?.response?.data?.message || "Error inesperado",
      timer: 2000,
      showConfirmButton: false,
      timerProgressBar: true,
    });
  }, []);

  return { errorAlert };
}

export function useSuccessAlert () {
  const successAlert = useCallback((title, res) => {
    Swal.fire({
      icon: "success",
      title,
      text: res.message,
      timer: 2000,
      showConfirmButton: false,
      timerProgressBar: true,
    });
  }, []);

  return { successAlert };
}
