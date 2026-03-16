import { supabase } from "../../config/supabase.js"

const form = document.getElementById("certificateForm")

if(form){

form.addEventListener("submit", async (e)=>{

e.preventDefault()

const studentName =
document.getElementById("studentName").value

const courseTitle =
document.getElementById("courseTitle").value

const completionDate =
document.getElementById("completionDate").value

const certificateId =
"ISC-" + Math.floor(Math.random()*1000000)

const {data,error} =
await supabase.from("certificates").insert([{

student_name:studentName,
course_title:courseTitle,
completion_date:completionDate,
certificate_id:certificateId

}])

if(error){

document.getElementById("result").innerText =
"Error generating certificate"

}else{

document.getElementById("result").innerText =
"Certificate Generated ID: " + certificateId

}

})

}

window.verifyCertificate = async function(){

const id =
document.getElementById("certificateId").value

const {data,error} =
await supabase.from("certificates")
.select("*")
.eq("certificate_id",id)
.single()

if(error){

document.getElementById("certificateResult").innerText =
"Certificate not found"

}else{

document.getElementById("certificateResult").innerHTML =
`
<h3>Certificate Valid</h3>
<p>Name: ${data.student_name}</p>
<p>Course: ${data.course_title}</p>
<p>Date: ${data.completion_date}</p>
`

}

}
