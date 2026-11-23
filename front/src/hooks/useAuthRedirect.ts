import { useSearchParams } from "react-router-dom";
import { safeRedirectPath } from "../utils/redirect";

const HOME = "/";
const NEXT_PARAM = "next";

export function useAuthRedirect() {
  const [searchParams] = useSearchParams();
  const redirectTo = safeRedirectPath(searchParams.get(NEXT_PARAM));

  function keepingNext(path: string) {
    if (redirectTo === HOME) return path;
    return `${path}?${new URLSearchParams({ [NEXT_PARAM]: redirectTo })}`;
  }

  return { redirectTo, keepingNext };
}
