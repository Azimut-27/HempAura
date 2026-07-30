import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { rememberReferralCode } from "../lib/referral.js";

export default function ReferralAttribution() {
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    rememberReferralCode(params.get("ref") || "");
  }, [location.search]);

  return null;
}
