import { supabase } from '../config/supabase.js';

const container = document.getElementById('notificationList');

async function loadNotifications(){
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if(!user) return;

  const { data } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  container.innerHTML = '';

  data.forEach(n => {
    const div = document.createElement('div');
    div.innerHTML = `
      <b>${n.title}</b>
      <p>${n.message}</p>
      <small>${new Date(n.created_at).toLocaleString()}</small>
      <hr>
    `;

    div.onclick = async ()=>{
      await supabase.from('notifications')
        .update({ is_read: true })
        .eq('id', n.id);
    };

    container.appendChild(div);
  });
}

loadNotifications();
