// ===== Login/Register =====
function showRegister(){
    document.getElementById("loginDiv").style.display="none";
    document.getElementById("registerDiv").style.display="block";
}

function showLogin(){
    document.getElementById("loginDiv").style.display="block";
    document.getElementById("registerDiv").style.display="none";
}

function register(){
    let u = document.getElementById("regUser").value;
    let p = document.getElementById("regPass").value;
    let h = document.getElementById("regHint").value;

    if(!u || !p) { alert("Isi username & password"); return; }

    let users = JSON.parse(localStorage.getItem("users") || "[]");
    if(users.find(x=>x.username===u)) { alert("Username sudah ada"); return; }

    users.push({username:u,password:p,hint:h,transactions:[]});
    localStorage.setItem("users", JSON.stringify(users));
    alert("Register berhasil!");
    showLogin();
}

function login(){
    let u = document.getElementById("loginUser").value;
    let p = document.getElementById("loginPass").value;
    let users = JSON.parse(localStorage.getItem("users") || "[]");
    let user = users.find(x=>x.username===u && x.password===p);
    if(user){
        localStorage.setItem("currentUser", u);
        window.location.href="app.html";
    } else {
        alert("Username/Password salah");
    }
}

function logout(){
    localStorage.removeItem("currentUser");
    window.location.href="index.html";
}

// ===== Dark Mode =====
if(localStorage.getItem('darkMode')==='on'){
    document.body.classList.add('dark-mode');
}
function toggleDarkMode(){
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode')?'on':'off');
}

// ===== Transaksi =====
let transactions = [];

function loadTransactions(){
    let currentUser = localStorage.getItem("currentUser");
    if(!currentUser) return window.location.href="index.html";

    let users = JSON.parse(localStorage.getItem("users") || "[]");
    let user = users.find(x=>x.username===currentUser);
    transactions = user.transactions || [];
    renderTransactions();
}

function addTransaction(){
    let desc = document.getElementById("desc").value;
    let amount = Number(document.getElementById("amount").value);
    let type = document.getElementById("type").value;
    let kategori = document.getElementById("kategori").value;

    if(!desc || !amount) { alert("Isi semua kolom"); return; }

    transactions.push({deskripsi:desc, jumlah:amount, tipe:type, kategori:kategori});
    saveTransactions();
    renderTransactions();
}

function saveTransactions(){
    let currentUser = localStorage.getItem("currentUser");
    let users = JSON.parse(localStorage.getItem("users") || "[]");
    let user = users.find(x=>x.username===currentUser);
    user.transactions = transactions;
    localStorage.setItem("users", JSON.stringify(users));
}

function renderTransactions(){
    let tbody = document.querySelector("#transactionTable tbody");
    tbody.innerHTML="";
    transactions.forEach((t,i)=>{
        let tr = `<tr>
            <td>${t.deskripsi}</td>
            <td>Rp ${t.jumlah}</td>
            <td>${t.tipe}</td>
            <td>${t.kategori}</td>
            <td><button onclick="deleteTransaction(${i})">Hapus</button></td>
        </tr>`;
        tbody.innerHTML += tr;
    });
    document.getElementById("totalSaldo").innerText = hitungSaldo();
}

function deleteTransaction(index){
    transactions.splice(index,1);
    saveTransactions();
    renderTransactions();
}

function hitungSaldo(){
    let total=0;
    transactions.forEach(tr=>{
        if(tr.tipe==="tabungan") total += Number(tr.jumlah);
        else if(tr.tipe==="pengeluaran") total -= Number(tr.jumlah);
    });
    return total;
}

// ===== Export =====
function exportPDF(){
    let doc = new jsPDF();
    doc.text("Laporan Transaksi",14,20);
    let body = transactions.map(t=>[t.deskripsi, t.jumlah, t.tipe, t.kategori]);
    doc.autoTable({ head:[["Deskripsi","Jumlah","Tipe","Kategori"]], body:body, startY:30 });
    doc.save("laporan.pdf");
}

function exportExcel(){
    let wb = XLSX.utils.book_new();
    let ws_data = [["Deskripsi","Jumlah","Tipe","Kategori"],...transactions.map(t=>[t.deskripsi,t.jumlah,t.tipe,t.kategori])];
    let ws = XLSX.utils.aoa_to_sheet(ws_data);
    XLSX.utils.book_append_sheet(wb, ws, "Transaksi");
    XLSX.writeFile(wb, "laporan.xlsx");
}

// Load transaksi saat app.html dibuka
if(window.location.href.includes("app.html")) loadTransactions();
