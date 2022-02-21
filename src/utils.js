const loginForm = document.getElementById("login");
const chat = document.getElementById("chat");

export function getLoginFormData() {
  return {
    email: loginForm.email.value,
    password: loginForm.password.value,
  };
}

export function toggleChatAndLoginFormVisability(loginFormDispaly, chatDisplay) {
  loginForm.style.display = loginFormDispaly;
  chat.style.display = chatDisplay;
}