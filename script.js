const BASE_URL = "http://localhost:8080";

function showSection(id){
    document.querySelectorAll(".section").forEach(sec => sec.style.display = 'none');
    document.getElementById(id).style.display = 'block';
}

//create account

function createAccount(){
    const data = {
        name : document.getElementById("c-name").value,
        email : documnet.getElementById("c-email").value,
        balance : documnet.getElementById("c-balance").value
    };

    

}