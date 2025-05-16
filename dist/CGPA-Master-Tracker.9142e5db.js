// import { initializeApp } from "firebase/app";
// import {
//   getAuth,
//   createUserWithEmailAndPassword,
//   signInWithEmailAndPassword,
// } from "firebase/auth";
// import { getDatabase, ref, set } from "firebase/database";
const firebaseConfig = {
    apiKey: "AIzaSyA-ZfLVt-mMYlewskoMF0xVdp7ODXykBMs",
    authDomain: "cgpa-master-calculator.firebaseapp.com",
    projectId: "cgpa-master-calculator",
    storageBucket: "cgpa-master-calculator.firebasestorage.app",
    messagingSenderId: "127347563364",
    appId: "1:127347563364:web:a5b7f218cffaf0401cf871",
    databaseURL: "https://cgpa-master-calculator-default-rtdb.firebaseio.com"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
function signUpUser() {
    const name = document.getElementById("signup-name").value.trim();
    const matric = document.getElementById("signup-matric").value.trim().toUpperCase();
    const email = document.getElementById("signup-email").value.trim();
    const password = document.getElementById("signup-password").value.trim();
    if (!name || !matric || !email || !password) {
        alert("Please fill all fields.");
        return;
    }
    createUserWithEmailAndPassword(auth, email, password).then((userCredential)=>{
        const user = userCredential.user;
        set(ref(db, "users/" + user.uid), {
            name: name,
            matric: matric,
            email: email
        });
        alert("Account created successfully!");
        window.location.href = "index.html";
    }).catch((error)=>{
        const errorCode = error.code;
        const errorMessage = error.message;
        alert("Error: " + errorMessage);
        console.error("Signup Error:", error);
    });
}
function loginUser() {
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value.trim();
    if (!email || !password) {
        alert("Please enter email and password.");
        return;
    }
    signInWithEmailAndPassword(auth, email, password).then((userCredential)=>{
        const user = userCredential.user;
        console.log("User logged in:", user);
        alert("\uD83D\uDC4B Welcome back!");
        window.location.href = "homePage.html";
    }).catch((error)=>{
        const errorCode = error.code;
        const errorMessage = error.message;
        alert("Error logging in: " + errorMessage);
        console.error("Login Error:", error);
    });
}
document.addEventListener("DOMContentLoaded", ()=>{
    const signupButton = document.getElementById("signup-button");
    const loginButton = document.getElementById("login-button");
    if (signupButton) signupButton.addEventListener("click", signUpUser);
    if (loginButton) loginButton.addEventListener("click", loginUser);
});
function deleteRow(button) {
    const row = button.closest("tr");
    row.remove();
}
function addSemester() {
    const semester = document.getElementById("semesterSelect").value;
    const tablesContainer = document.getElementById("semester-tables");
    if (document.getElementById(semester)) {
        alert(`${semester} already exists.`);
        return;
    }
    const wrapper = document.createElement("div");
    wrapper.innerHTML = `
    <h3>${semester}</h3>
    <table id="${semester}" class="input-table">
      <thead>
        <tr>
          <th>Course</th>
          <th>Credit</th>
          <th>Grade</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody></tbody>
    </table>
    <button class="btn" onclick="addSemesterRow('${semester}')">Add Course</button>
    <button class="btn" onclick="calculateGPA('${semester}')">Calculate GPA</button>
  `;
    tablesContainer.appendChild(wrapper);
}
function addSemesterRow(semester) {
    const table = document.getElementById(semester);
    if (!table) return;
    const row = document.createElement("tr");
    row.innerHTML = `
    <td><input type="text" placeholder="Course" /></td>
    <td><input type="number" placeholder="Credit" /></td>
    <td><input type="text" placeholder="Grade or Score" /></td>
    <td><button class="delete-btn" onclick="deleteRow(this)">Delete</button></td>
  `;
    table.querySelector("tbody").appendChild(row);
}
function gradeToPoint(grade) {
    const points = {
        A: 5,
        B: 4,
        C: 3,
        D: 2,
        E: 1,
        F: 0
    };
    return points[grade.toUpperCase()] ?? null;
}
function scoreToGrade(score) {
    if (score >= 70 && score <= 100) return "A";
    if (score >= 60) return "B";
    if (score >= 50) return "C";
    if (score >= 45) return "D";
    if (score >= 40) return "E";
    return "F";
}
function calculateGPA(semester) {
    const table = document.getElementById(semester);
    const rows = table.querySelectorAll("tbody tr");
    let totalPoints = 0;
    let totalCredits = 0;
    rows.forEach((row)=>{
        const inputs = row.querySelectorAll("input");
        const credit = parseFloat(inputs[1].value);
        let gradeInput = inputs[2].value.trim().toUpperCase();
        if (!credit || !gradeInput) {
            alert(`\u{26A0}\u{FE0F} Please fill in both credit and grade for all courses in ${semester}.`);
            throw new Error("Missing credit or grade input");
        }
        if (!isNaN(gradeInput)) {
            const score = parseFloat(gradeInput);
            if (score < 0 || score > 100) {
                alert(`\u{26A0}\u{FE0F} Invalid score '${score}'.`);
                throw new Error("Invalid score");
            }
            gradeInput = scoreToGrade(score);
        }
        const point = gradeToPoint(gradeInput);
        if (point === null || isNaN(credit)) return;
        totalPoints += credit * point;
        totalCredits += credit;
    });
    let gpaDisplay = document.getElementById(`${semester}-gpa`);
    if (gpaDisplay) gpaDisplay.remove();
    gpaDisplay = document.createElement("p");
    gpaDisplay.id = `${semester}-gpa`;
    if (totalCredits === 0) {
        gpaDisplay.textContent = `\u{26A0}\u{FE0F} No valid data for ${semester}`;
        gpaDisplay.style.color = "red";
    } else {
        const gpa = (totalPoints / totalCredits).toFixed(2);
        gpaDisplay.textContent = `\u{1F4D8} GPA for ${semester}: ${gpa}`;
        gpaDisplay.style.color = "#1976d2";
    }
    table.parentElement.appendChild(gpaDisplay);
}
function calculateCGPA() {
    const tables = document.querySelectorAll(".input-table");
    let semesterData = {};
    let totalPoints = 0;
    let totalCredits = 0;
    let tableData = {};
    tables.forEach((table)=>{
        const semester = table.id;
        const rows = table.querySelectorAll("tbody tr");
        let semPoints = 0;
        let semCredits = 0;
        tableData[semester] = [];
        rows.forEach((row)=>{
            const inputs = row.querySelectorAll("input");
            const course = inputs[0].value.trim();
            const credit = parseFloat(inputs[1].value);
            let gradeInput = inputs[2].value.trim().toUpperCase();
            if (!gradeInput) return;
            if (!isNaN(gradeInput)) {
                const score = parseFloat(gradeInput);
                if (score < 0 || score > 100) {
                    alert(`\u{26A0}\u{FE0F} Invalid score '${score}'.`);
                    return;
                }
                gradeInput = scoreToGrade(score);
            }
            const point = gradeToPoint(gradeInput);
            tableData[semester].push({
                course,
                credit: inputs[1].value,
                grade: inputs[2].value
            });
            if (!isNaN(credit) && point !== null) {
                semPoints += credit * point;
                semCredits += credit;
            }
        });
        if (semCredits > 0) {
            const gpa = (semPoints / semCredits).toFixed(2);
            semesterData[semester] = {
                gpa,
                points: semPoints,
                credits: semCredits
            };
            totalPoints += semPoints;
            totalCredits += semCredits;
            let gpaDisplay = document.getElementById(`${semester}-gpa`);
            if (!gpaDisplay) {
                gpaDisplay = document.createElement("p");
                gpaDisplay.id = `${semester}-gpa`;
                table.parentElement.appendChild(gpaDisplay);
            }
            gpaDisplay.textContent = `\u{1F4D8} GPA for ${semester}: ${gpa}`;
            gpaDisplay.style.color = "#1976d2";
        }
    });
    const resultDiv = document.getElementById("cgpa-result");
    if (totalCredits === 0) {
        resultDiv.textContent = "\u26A0\uFE0F No valid grades entered.";
        resultDiv.style.color = "red";
        return;
    }
    const cgpa = (totalPoints / totalCredits).toFixed(2);
    let message = `\u{1F393} CGPA: ${cgpa}`;
    let color = "#24633c";
    const numericCGPA = parseFloat(cgpa);
    if (numericCGPA >= 4.5) {
        message += " \u2013 First Class \uD83C\uDF89";
        color = "green";
    } else if (numericCGPA >= 3.5) {
        message += " \u2013 Second Class Upper \uD83D\uDC4D";
        color = "blue";
    } else if (numericCGPA >= 2.5) {
        message += " \u2013 Second Class Lower \uD83D\uDC4C";
        color = "orange";
    } else if (numericCGPA >= 1.5) {
        message += " \u2013 Third Class \u26A0\uFE0F";
        color = "tomato";
    } else {
        message += " \u2013 Probation \uD83D\uDEA8";
        color = "darkred";
    }
    resultDiv.textContent = message;
    resultDiv.style.color = color;
    const matric = localStorage.getItem("activeUser");
    const storedUser = JSON.parse(localStorage.getItem(matric) || "{}");
    const updatedUser = {
        ...storedUser,
        tableData,
        semesterData,
        cgpaMessage: message,
        cgpaColor: color
    };
    localStorage.setItem(matric, JSON.stringify(updatedUser));
    const labels = Object.keys(semesterData);
    const data = labels.map((sem)=>semesterData[sem].gpa);
    drawLineChart(labels, data);
}
let gpaChart;
function drawLineChart(labels, data) {
    const ctx = document.getElementById("gpaChart").getContext("2d");
    if (gpaChart) gpaChart.destroy();
    gpaChart = new Chart(ctx, {
        type: "line",
        data: {
            labels,
            datasets: [
                {
                    label: "GPA Progress",
                    data,
                    borderColor: "#24633c",
                    backgroundColor: "#24633c",
                    tension: 0.3,
                    pointRadius: 5,
                    pointHoverRadius: 7
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    suggestedMin: 0,
                    suggestedMax: 5,
                    title: {
                        display: true,
                        text: "GPA"
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: "Semester"
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}
function loadSavedResults() {
    const matric = localStorage.getItem("activeUser");
    const userData = JSON.parse(localStorage.getItem(matric) || "{}");
    const name = userData.userName;
    const welcomeMessage = document.getElementById("welcome-message");
    if (name && welcomeMessage) {
        welcomeMessage.textContent = `Welcome, ${name}!`;
        welcomeMessage.style.color = "#24633c";
        welcomeMessage.style.fontWeight = "600";
    }
    const tableData = userData.tableData || {};
    const semesterData = userData.semesterData || {};
    Object.keys(tableData).forEach((semester)=>{
        // Manually add the semester UI
        addSemesterFromLoad(semester);
        const table = document.getElementById(semester);
        const tbody = table.querySelector("tbody");
        tbody.innerHTML = "";
        tableData[semester].forEach((rowData)=>{
            const row = document.createElement("tr");
            row.innerHTML = `
        <td><input type="text" value="${rowData.course}" /></td>
        <td><input type="number" value="${rowData.credit}" /></td>
        <td><input type="text" value="${rowData.grade}" /></td>
        <td><button class="delete-btn" onclick="deleteRow(this)">Delete</button></td>
      `;
            tbody.appendChild(row);
        });
        if (semesterData[semester]) {
            const gpa = semesterData[semester].gpa;
            const gpaDisplay = document.createElement("p");
            gpaDisplay.id = `${semester}-gpa`;
            gpaDisplay.textContent = `\u{1F4D8} GPA for ${semester}: ${gpa}`;
            gpaDisplay.style.color = "#1976d2";
            table.parentElement.appendChild(gpaDisplay);
        }
    });
    const resultDiv = document.getElementById("cgpa-result");
    if (userData.cgpaMessage && resultDiv) {
        resultDiv.textContent = userData.cgpaMessage;
        resultDiv.style.color = userData.cgpaColor;
    }
    const labels = Object.keys(semesterData);
    const data = labels.map((sem)=>semesterData[sem].gpa);
    if (labels.length && data.length) drawLineChart(labels, data);
}
function addSemesterFromLoad(semester) {
    const tablesContainer = document.getElementById("semester-tables");
    if (document.getElementById(semester)) return;
    const wrapper = document.createElement("div");
    wrapper.innerHTML = `
    <h3>${semester}</h3>
    <table id="${semester}" class="input-table">
      <thead>
        <tr>
          <th>Course</th>
          <th>Credit</th>
          <th>Grade</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody></tbody>
    </table>
    <button class="btn" onclick="addSemesterRow('${semester}')">Add Course</button>
    <button class="btn" onclick="calculateGPA('${semester}')">Calculate GPA</button>
  `;
    tablesContainer.appendChild(wrapper);
}
function saveCGPA() {
    alert("\u2705 Your CGPA and data are already saved.");
}
function resetCalculator() {
    if (confirm("\u26A0\uFE0F This will erase all your data. Continue?")) {
        const matric = localStorage.getItem("activeUser");
        if (matric) localStorage.removeItem(matric);
        localStorage.removeItem("activeUser");
        location.reload();
    }
}
window.addEventListener("load", loadSavedResults);

//# sourceMappingURL=CGPA-Master-Tracker.9142e5db.js.map
