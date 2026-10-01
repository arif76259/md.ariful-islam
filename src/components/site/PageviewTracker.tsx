import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

let recorded = false;

/** Records one pageview per session on the public site. */
export function PageviewTracker() {
  useEffect(() => {
    if (recorded) return;
    recorded = true;
    void supabase.from("pageviews").insert({
      path: window.location.pathname,
      referrer: document.referrer || "",
      user_agent: navigator.userAgent || "",
    });
  }, []);
  return null;
}
