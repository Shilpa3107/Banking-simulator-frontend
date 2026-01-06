const BASE_URL = "http://localhost:8080";

function showSection(id){
    document.querySelectorAll(".section").forEach(sec => sec.style.display = 'none');
    document.getElementById(id).style.display = 'block';
}

//create account

function createAccount(){
    const data = {
        name : document.getElementById("c-name").value,
        email : document.getElementById("c-email").value,
        balance : document.getElementById("c-balance").value
    };

    fetch(BASE_URL+"/accounts/create" ,{
        method : "POST",
        headers : {
            "Content-Type" : "application/json"
        },
        body : JSON.stringify(data)
    })
    .then(res => res.json())
    .then(result => {
        document.getElementById("create-result").innerText = "Account is Created and here is your Account Number "+result.accountNumber;
        console.log("Account is created successfully..!");
        
    });
    

}

function deposite(){
    const data = {
        accNo : document.getElementById("d-acc").value,
        amount : document.getElementById("d-amount").value
    };

    fetch(BASE_URL+"/transactions/deposite" ,{
        method : "POST",
        headers : {
            "Content-Type" : "application/json"
        },
        body : JSON.stringify(data)
    })
    .then(res => res.text())
    .then(msg => {
        document.getElementById("deposite-result").innerText = msg;
        console.log("Amount is deposited successfully..!");
    });
    
}

function withdraw(){
    const data = {
        accNo : document.getElementById("w-acc").value,
        amount : document.getElementById("w-amount").value
    };
    
    fetch(BASE_URL+"/transactions/withdraw" ,{
        method : "POST",
        headers : {
            "Content-Type" : "application/json"
        },
        body : JSON.stringify(data)
    })
    .then(res => res.text())
    .then(msg => {
        document.getElementById("withdraw-result").innerText = msg;
        console.log("Amount is withdraw successfully..!");
    });
    
}

function transfer(){
    const data = {
        fromAcc : document.getElementById("t-from").value,
        toAcc : document.getElementById("t-to").value,
        amount : document.getElementById("t-amount").value
    }
    
    fetch(BASE_URL+"/transactions/transfer",{
        method : "POST",
        headers : {
            "Content-Type" : "application/json"
        },
        body : JSON.stringify(data)
    })
    .then(res => res.text())
    .then(msg => {
        document.getElementById("trasfer-result").innerText = msg;
        console.log("Amount is Transfer successfully..!");
    });
}

function viewAccount(){
    const acc = document.getElementById("v-acc").value;

    fetch(BASE_URL+"/accounts/"+acc)
    .then(res => res.json())
    .then(data => {
        document.getElementById("view-result").innerText = JSON.stringify(data);
    });
}

function listAccount(){
    fetch(BASE_URL+"/accounts/all")
    .then(res => res.json())
    .then(data => {
        document.getElementById("list-result").innerText = JSON.stringify(data);
    });
}