import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/** Records one pageview per mount on the public site. */
export function PageviewTracker() {
  useEffect(() => {
    if (window.location.hostname === "localhost") return;
    void supabase.from("pageviews").insert({
      path: window.location.pathname,
      referrer: document.referrer || "",
      user_agent: navigator.userAgent || "",
    });
  }, []);
  return null;
}
