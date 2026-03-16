import { supabase } from "../../config/supabase.js"

// SIGNUP

const signupForm = document.getElementById("signupForm")

if (signupForm) {

signupForm.addEventListener("submit", async (e) => {

e.preventDefault()

const email = document.getElementById("email").value
const password = document.getElementById("password").value
const role = document.getElementById("role").value

const { data, error } = await supabase.auth.signUp({
email,
password
})

if (error) {
alert(error.message)
return
}

// save role

await supabase
.from("profiles")
.insert([
{
id: data.user.id,
email: email,
role: role
}
])

alert("Signup successful. Check your email for verification.")

window.location.href = "login.html"

})

}

// LOGIN

const loginForm = document.getElementById("loginForm")

if (loginForm) {

loginForm.addEventListener("submit", async (e) => {

e.preventDefault()

const email = document.getElementById("loginEmail").value
const password = document.getElementById("loginPassword").value

const { data, error } = await supabase.auth.signInWithPassword({

email,
password

})

if (error) {
alert(error.message)
return
}

// fetch user role

const { data: profile } = await supabase
.from("profiles")
.select("role")
.eq("id", data.user.id)
.single()

if (email === "abdulmalikmusba@gmail.com") {

window.location.href = "../admin/index.html"

return

}

if (profile.role === "client") {

window.location.href = "../dashboard/client-dashboard.html"

}

if (profile.role === "student") {

window.location.href = "../academy/courses.html"

}

})

}
