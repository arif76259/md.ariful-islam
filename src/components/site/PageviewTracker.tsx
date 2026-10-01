import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/** Records one pageview per mount on the public site. */
export function PageviewTracker() {
  useEffect(() => {
    // Count every visit — preview and published site alike.
    console.log("[pv] tracking", window.location.pathname);
    supabase
      .from("pageviews")
      .insert({
        path: window.location.pathname,
        referrer: document.referrer || "",
        user_agent: navigator.userAgent || "",
      })
      .then(({ error }) => {
        if (error) console.warn("[pv] insert failed", error.message);
        else console.log("[pv] recorded");
      });
  }, []);
  return null;
}
