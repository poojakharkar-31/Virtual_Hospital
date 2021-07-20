window.addEventListener('load', () => {

	const params = (new URL(document.location)).searchParams;
	const username = params.get('username');
	const email = params.get('email');
	const password = params.get('password');
	const mobile = params.get('mobile');

	document.getElementById("username").innerHTML = username;
	document.getElementById("email").innerHTML = email;
	document.getElementById("password").innerHTML = password;
	document.getElementById("mobile").innerHTML = mobile;

})