// PurePick role-based authentication for the project review.
const ADMIN_ACCOUNTS = {
  "admin@purepick.com": "admin123",
  "manager@purepick.com": "manager123"
};

function getUsers(){
  try { return JSON.parse(localStorage.getItem("purepickUsers") || "[]"); }
  catch(e) { return []; }
}

function saveCurrentUser(user){
  const normalizedUser = {
    name: user.name || "PurePick User",
    email: String(user.email || "").toLowerCase(),
    role: user.role === "admin" ? "admin" : "user"
  };
  localStorage.setItem("purepickUser", JSON.stringify(normalizedUser));
  localStorage.setItem("purepickCurrentUser", JSON.stringify(normalizedUser));
  localStorage.setItem("purepickLoggedIn", "true");
  return normalizedUser;
}

function finishLogin(user){
  const currentUser = saveCurrentUser(user);
  localStorage.removeItem("purepickReturnUrl");
  if(currentUser.role === "admin"){
    location.replace("admin.html");
  }else{
    location.replace("dashboard.html");
  }
}

const userMode = document.getElementById("userMode");
const adminMode = document.getElementById("adminMode");
const title = document.getElementById("loginTitle");
const subtitle = document.getElementById("loginSubtitle");
const button = document.getElementById("loginButton");
const demo = document.getElementById("adminDemo");
const signupPrompt = document.getElementById("signupPrompt");
const emailInput = document.getElementById("loginEmail");
const passwordInput = document.getElementById("loginPassword");
let loginMode = "user";

function setLoginMode(mode){
  loginMode = mode;
  const admin = mode === "admin";
  userMode.classList.toggle("active", !admin);
  adminMode.classList.toggle("active", admin);
  title.textContent = admin ? "Admin Login" : "Customer Login";
  subtitle.textContent = admin ? "Login to manage PurePick orders, customers and sales." : "Login to continue shopping.";
  button.textContent = admin ? "Login as Admin" : "Login as Customer";
  demo.style.display = admin ? "block" : "none";
  signupPrompt.style.display = admin ? "none" : "block";
  if(admin){
    emailInput.value = "admin@purepick.com";
    passwordInput.value = "admin123";
  }else{
    emailInput.value = "";
    passwordInput.value = "";
  }
}

if(userMode) userMode.addEventListener("click",()=>setLoginMode("user"));
if(adminMode) adminMode.addEventListener("click",()=>setLoginMode("admin"));

const sf = document.getElementById("signupForm");
if(sf) sf.addEventListener("submit", e => {
  e.preventDefault();
  const name = document.getElementById("signupName").value.trim();
  const email = document.getElementById("signupEmail").value.trim().toLowerCase();
  const p = document.getElementById("signupPassword").value;
  const c = document.getElementById("confirmPassword").value;
  if(p !== c){ alert("Passwords do not match."); return; }
  if(ADMIN_ACCOUNTS[email]){ alert("This email is reserved for the PurePick administrator."); return; }
  const users = getUsers();
  if(users.some(u => String(u.email).toLowerCase() === email)){ alert("This email is already registered. Please login."); return; }
  const user = {name,email,password:p,role:"user"};
  users.push(user);
  localStorage.setItem("purepickUsers", JSON.stringify(users));
  alert("Account created successfully!");
  finishLogin(user);
});

const lf = document.getElementById("loginForm");
if(lf) lf.addEventListener("submit", e => {
  e.preventDefault();
  const email = emailInput.value.trim().toLowerCase();
  const pass = passwordInput.value;

  if(loginMode === "admin"){
    if(ADMIN_ACCOUNTS[email] && ADMIN_ACCOUNTS[email] === pass){
      finishLogin({name: email === "admin@purepick.com" ? "PurePick Admin" : "PurePick Manager", email, role:"admin"});
    }else{
      alert("Invalid admin email or password. Use the Admin credentials shown above.");
    }
    return;
  }

  // Customer mode never accepts an admin account.
  if(ADMIN_ACCOUNTS[email]){
    alert("This is an administrator account. Select the Admin login option.");
    return;
  }
  const user = getUsers().find(u => String(u.email).toLowerCase() === email && u.password === pass);
  if(!user){ alert("Invalid email or password."); return; }
  finishLogin({name:user.name,email:user.email,role:"user"});
});
