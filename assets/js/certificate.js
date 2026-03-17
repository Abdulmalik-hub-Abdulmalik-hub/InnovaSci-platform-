import { supabase } from "../../config/supabase.js"

const form=document.getElementById("certificateForm")

if(form){

form.addEventListener("submit",async(e)=>{

e.preventDefault()

const name=document.getElementById("studentName").value
const course=document.getElementById("courseTitle").value
const date=document.getElementById("completionDate").value

// CERTIFICATE ID
const certId="ISC-"+Math.floor(Math.random()*1000000)

document.getElementById("certStudent").innerText=name
document.getElementById("certCourse").innerText=course
document.getElementById("certDate").innerText=date
document.getElementById("certId").innerText=certId

// HASH SECURITY
const hash=CryptoJS.SHA256(name+course+date+certId).toString()

// VERIFY URL
const verifyUrl=window.location.origin+"/certificate/verify.html?id="+certId

// QR CODE
QRCode.toCanvas(
document.getElementById("qrCode"),
verifyUrl
)

// GENERATE PDF

const { jsPDF } = window.jspdf

const pdf=new jsPDF("landscape")

await pdf.html(
document.getElementById("certificateTemplate"),
{

callback:async function(pdf){

const blob=pdf.output("blob")

const fileName=certId+".pdf"

// UPLOAD PDF

const {data,error}=await supabase.storage
.from("certificates")
.upload(fileName,blob)

if(error){

alert("Upload error")

return

}

// PUBLIC URL

const url=supabase.storage
.from("certificates")
.getPublicUrl(fileName).data.publicUrl

// SAVE RECORD

await supabase.from("certificates").insert([{

student_name:name,
course_title:course,
completion_date:date,
certificate_id:certId,
certificate_hash:hash,
certificate_url:url

}])

// DOWNLOAD

window.open(url)

alert("Certificate Generated Successfully")

}

}

)

})

}
// ==== Toggle Notification Panel ====
function toggleNotifPanel() {
  const panel = document.querySelector('.notif-list');
  panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
}

// Expose globally so HTML button onclick can use it
window.toggleNotifPanel = toggleNotifPanel;
