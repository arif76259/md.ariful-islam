import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

let recorded = false;

/** Records one pageview per session on the public site. */
export function PageviewTracker() {
  useEffect(() => {
    if (recorded) return;
    recorded = true;
    // supabase-js only sends the request once the builder is awaited/then'd.
    void supabase
      .from("pageviews")
      .insert({
        path: window.location.pathname,
        referrer: document.referrer || "",
        user_agent: navigator.userAgent || "",
      })
      .then(({ error }) => {
        if (error) console.warn("pageview tracking failed:", error.message);
      });
  }, []);
  return null;
}
