import { supabase } from '../config/supabase.js';

export async function sendNotification(user_id, title, message, type = "info") {
  const { error } = await supabase.from('notifications').insert([{
    user_id,
    title,
    message,
    type
  }]);

  if (error) {
    console.error("Notification error:", error.message);
  }
}
