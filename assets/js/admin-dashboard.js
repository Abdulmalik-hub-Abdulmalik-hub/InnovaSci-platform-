import { supabase } from '../config/supabase.js';

// Logout
const logoutBtn = document.getElementById('logoutBtn');
if(logoutBtn){
  logoutBtn.addEventListener('click', async ()=>{
    await supabase.auth.signOut();
    window.location.href = '../portal/login.html';
  });
}

// Dashboard Stats
async function loadDashboardStats(){
  const { data: courses } = await supabase.from('courses').select('*');
  const { data: projects } = await supabase.from('projects').select('*');
  const { data: students } = await supabase.from('profiles').select('*').eq('role','student');
  const { data: blogs } = await supabase.from('blogs').select('*');

  document.getElementById('totalCourses').textContent = courses ? courses.length : 0;
  document.getElementById('totalProjects').textContent = projects ? projects.length : 0;
  document.getElementById('totalStudents').textContent = students ? students.length : 0;
  document.getElementById('totalBlogs').textContent = blogs ? blogs.length : 0;
}
loadDashboardStats();

// Founder Section
const founderForm = document.getElementById('founderForm');
const formMsg = document.getElementById('formMsg');

async function loadFounderInfo(){
  const { data } = await supabase.from('founder_info')
                                  .select('*')
                                  .order('id',{ascending:true})
                                  .limit(1)
                                  .single();
  if(data){
    document.getElementById('founderName').value = data.full_name;
    document.getElementById('founderTitle').value = data.title;
    document.getElementById('founderBio').value = data.bio;
    document.getElementById('founderEducation').value = data.education;
    document.getElementById('founderSkills').value = data.skills;
  }
}
loadFounderInfo();

if(founderForm){
  founderForm.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const payload = {
      full_name: document.getElementById('founderName').value,
      title: document.getElementById('founderTitle').value,
      bio: document.getElementById('founderBio').value,
      education: document.getElementById('founderEducation').value,
      skills: document.getElementById('founderSkills').value,
      updated_at: new Date()
    };
    const { data, error } = await supabase.from('founder_info').upsert([payload]);
    if(error){ 
      formMsg.textContent = error.message; 
      return; 
    }
    formMsg.textContent = 'Founder info updated successfully!';
  });
}
