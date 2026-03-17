// =======================
// notifications.js
// Full ready-to-run for Module 8
// Features:
// - Load last 20 notifications
// - Realtime updates via Supabase
// - Toast popup for new notifications
// - Mark-as-read functionality
// =======================

import { supabase } from '../config/supabase.js';

// DOM elements
const notifList = document.getElementById('notifList');
const notifBadge = document.getElementById('notifBadge');
const toastContainer = document.getElementById('toastContainer');

// Load notifications from Supabase
async function loadNotifications() {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Failed to load notifications:', error);
    return;
  }

  // Update badge count
  notifBadge.textContent = data.length;

  // Populate notifications panel
  notifList.innerHTML = '';
  data.forEach((n, idx) => {
    const li = document.createElement('li');
    li.className = `notif-item ${n.type}`;
    li.innerHTML = `
      <strong>${n.title}</strong><br>
      <span>${n.message}</span><br>
      <small>${new Date(n.created_at).toLocaleString()}</small>
      <button class="mark-read-btn">Mark as Read</button>
    `;
    notifList.appendChild(li);

    // Show toast popup
    showToast(n.title, n.message, n.type);
  });

  // Add mark-as-read functionality
  document.querySelectorAll('.mark-read-btn').forEach((btn, idx) => {
    btn.addEventListener('click', async () => {
      const notif = data[idx];
      await supabase.from('notifications').delete().eq('id', notif.id);
      loadNotifications(); // refresh after deletion
    });
  });
}

// Show toast popup
function showToast(title, message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<strong>${title}</strong><br>${message}`;
  toastContainer.appendChild(toast);

  // Auto remove after 5 seconds
  setTimeout(() => toast.remove(), 5000);
}

// Toggle notifications panel visibility
function toggleNotifPanel() {
  const panel = document.querySelector('.notif-list');
  panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
}
window.toggleNotifPanel = toggleNotifPanel;

// Subscribe to realtime notifications
supabase
  .channel('public:notifications')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'notifications' },
    payload => {
      console.log('Realtime notification received:', payload.new);
      loadNotifications();
    }
  )
  .subscribe();

// Initial load
loadNotifications();
