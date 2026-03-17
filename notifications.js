// File: assets/js/notifications.js
// Purpose: Display live notifications in dashboard
import { supabase } from '../config/supabase.js';

const notifList = document.getElementById('notifList'); // <ul> container
const notifBadge = document.getElementById('notifBadge'); // <span> for count

// Load unseen notifications
async function loadNotifications() {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20); // last 20 notifications

  if (error) {
    console.error('Failed to load notifications:', error);
    return;
  }

  // Update badge
  notifBadge.textContent = data.length;

  // Populate list
  notifList.innerHTML = '';
  data.forEach(n => {
    const li = document.createElement('li');
    li.className = `notif-item ${n.type}`;
    li.innerHTML = `
      <strong>${n.title}</strong><br>
      <span>${n.message}</span><br>
      <small>${new Date(n.created_at).toLocaleString()}</small>
    `;
    notifList.appendChild(li);
  });
}

// Subscribe to real-time notifications
supabase
  .channel('public:notifications')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'notifications' },
    payload => {
      console.log('Realtime notification:', payload.new);
      loadNotifications();
    }
  )
  .subscribe();

// Initial load
loadNotifications();
