import { useLocation } from "react-router-dom";

export default function CurrentLocation() {
  const { pathname, search } = useLocation();
  return <span data-testid="location">{pathname + search}</span>;
}
