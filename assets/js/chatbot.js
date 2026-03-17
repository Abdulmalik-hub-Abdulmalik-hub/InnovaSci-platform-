import { supabase } from '../config/supabase.js';

// DOM Elements
const chatWidget = document.getElementById('chatWidget');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');

// Toggle chat
function toggleChat() {
  if(chatMessages.style.display === 'none' || chatMessages.style.display === ''){
    chatMessages.style.display = 'block';
  } else {
    chatMessages.style.display = 'none';
  }
}
window.toggleChat = toggleChat;

// Send user message
export async function sendMessage() {
  const userMsg = chatInput.value.trim();
  if(!userMsg) return;

  appendMessage(userMsg, 'user');
  chatInput.value = '';

  // Save user message to Supabase
  const user = supabase.auth.user();
  await supabase.from('chatbot_messages').insert([{ 
    user_id: user ? user.id : null,
    message: userMsg,
    sender: 'user'
  }]);

  // Generate AI response
  const botMsg = await generateAIResponse(userMsg);
  appendMessage(botMsg, 'bot');

  // Save bot response
  await supabase.from('chatbot_messages').insert([{
    user_id: user ? user.id : null,
    message: botMsg,
    sender: 'bot'
  }]);

  // Optional: trigger notification
  import('../js/notifications.js').then(({ sendNotification })=>{
    if(user) sendNotification(user.id, 'New Chat Message', botMsg, 'info');
  });
}

// Append message to chat
function appendMessage(msg, sender){
  const bubble = document.createElement('div');
  bubble.className = `chat-bubble ${sender}`;
  bubble.textContent = msg;
  chatMessages.appendChild(bubble);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// AI response generator
async function generateAIResponse(userMsg){
  // Simple keyword fallback if no API key
  const keywords = {
    'courses': 'You can view all available courses in the Academy section.',
    'projects': 'Go to Client Dashboard → Submit Project to send your project.',
    'certificate': 'Certificates are available after course completion in your Academy profile.',
    'faq': 'Ask me any question and I will try to assist you.'
  };
  const key = Object.keys(keywords).find(k => userMsg.toLowerCase().includes(k));
  if(key) return keywords[key];

  // Advanced: Call OpenAI GPT API
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type':'application/json',
        'Authorization':'Bearer YOUR_OPENAI_API_KEY' // replace with env variable later
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: userMsg }]
      })
    });
    const data = await res.json();
    return data.choices[0].message.content;
  } catch(e) {
    console.error('AI API error', e);
    return 'I am sorry, I cannot process your request at the moment.';
  }
}

// Initial load: fetch last 20 messages for current user
async function loadChatHistory(){
  const user = supabase.auth.user();
  if(!user) return;

  const { data, error } = await supabase.from('chatbot_messages')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(20);

  if(error){ console.error(error); return; }

  data.forEach(m => appendMessage(m.message, m.sender));
}
loadChatHistory();
