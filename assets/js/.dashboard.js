// Dashboard.js - Supabase integration
import { supabase } from '../config/supabase.js';

const logoutBtn = document.getElementById('logoutBtn');
logoutBtn.addEventListener('click', async () => {
  await supabase.auth.signOut();
  window.location.href = '../portal/login.html';
});

// Check authentication and redirect if not logged in
supabase.auth.getSession().then(({ data }) => {
  if (!data.session) {
    window.location.href = '../portal/login.html';
  }
});

// Submit Project
const projectForm = document.getElementById('projectForm');
const projectMsg = document.getElementById('projectMsg');

projectForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = document.getElementById('projectTitle').value;
  const description = document.getElementById('projectDescription').value;
  const files = document.getElementById('projectFiles').files;

  const user = supabase.auth.getUser().then(async ({ data }) => {
    const client_id = data.user.id;

    // Insert project
    const { data: projectData, error } = await supabase
      .from('projects')
      .insert([{ client_id, title, description }])
      .select()
      .single();

    if (error) {
      projectMsg.textContent = `Error: ${error.message}`;
      return;
    }

    // Upload files to storage
    if (files.length > 0) {
      for (let file of files) {
        const { error: uploadError } = await supabase.storage
          .from('project-files')
          .upload(`${projectData.id}/${file.name}`, file);

        if (uploadError) console.log('Upload error:', uploadError.message);
      }
    }

    projectMsg.textContent = 'Project submitted successfully!';
    projectForm.reset();
    loadProjects(); // refresh projects list
  });
});

// Load My Projects
const projectsList = document.getElementById('projectsList');
async function loadProjects() {
  const user = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('client_id', user.user.id)
    .order('created_at', { ascending: false });

  projectsList.innerHTML = '';
  if (data) {
    data.forEach(p => {
      const li = document.createElement('li');
      li.textContent = `${p.title} - Status: ${p.status}`;
      projectsList.appendChild(li);
    });
  }
}

// Initial load
loadProjects();
