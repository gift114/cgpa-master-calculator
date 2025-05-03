const firebaseConfig = {
  apiKey: "AIzaSyA-ZfLVt-mMYlewskoMF0xVdp7ODXykBMs",
  authDomain: "cgpa-master-calculator.firebaseapp.com",
  projectId: "cgpa-master-calculator",
  storageBucket: "cgpa-master-calculator.firebasestorage.app",
  messagingSenderId: "127347563364",
  appId: "1:127347563364:web:a5b7f218cffaf0401cf871",
  databaseURL: "https://cgpa-master-calculator-rtdb.firebaseio.com/:null",
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.database();

function signUpUser() {
  const name = document.getElementById("signup-name").value.trim();
  const matric = document.getElementById("signup-matric").value.trim();
  const email = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value;

  if (!name || !matric || !email || !password) {
    alert("⚠️ Please fill in all fields.");
    return;
  }

  auth
    .createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      return db.ref("users/" + user.uid).set({
        name: name,
        matric: matric,
        email: email,
        createdAt: new Date().toISOString(),
      });
    })
    .then(() => {
      alert("✅ Account created successfully! You can now log in.");
      window.location.href = "landing.html";
    })
    .catch((error) => {
      alert("❌ " + error.message);
    });
}

function loginUser() {
  const name = document.getElementById("name").value.trim();
  const matric = document.getElementById("matric").value.trim();

  const storedName = localStorage.getItem("userName");
  const storedMatric = localStorage.getItem("matricNumber");

  if (name === storedName && matric === storedMatric) {
    alert("👋 Welcome back, " + name + "!");
    window.location.href = "index.html";
  } else {
    alert("❌ Invalid credentials. Please try again or sign in as a new user.");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const name = localStorage.getItem("userName");
  const welcomeMessage = document.getElementById("welcome-message");

  if (name && welcomeMessage) {
    welcomeMessage.textContent = `Welcome, ${name}!`;
    welcomeMessage.style.color = "#24633c";
    welcomeMessage.style.fontWeight = "600";
  }
});

function deleteRow(button) {
  const row = button.closest("tr");
  row.remove();
}

function addSemester() {
  const semester = document.getElementById("semesterSelect").value;
  const tablesContainer = document.getElementById("semester-tables");

  // Check if the semester table already exists
  if (document.getElementById(semester)) {
    alert(`${semester} already exists.`);
    return;
  }

  // Create the semester table
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

  if (!table) {
    alert(`Semester ${semester} not found.`);
    return;
  }

  const row = document.createElement("tr");
  row.innerHTML = `
    <td><input type="text" placeholder="Course Name" /></td>
    <td><input type="number" placeholder="Credit" /></td>
    <td><input type="text" maxlength="3" placeholder="Grade" /></td>
    <td><button onclick="deleteRow(this)">Delete</button></td>
  `;
  table.querySelector("tbody").appendChild(row);
}
function gradeToPoint(grade) {
  const points = { A: 5, B: 4, C: 3, D: 2, E: 1, F: 0 };
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

  rows.forEach((row) => {
    const inputs = row.querySelectorAll("input");
    const credit = parseFloat(inputs[1].value);
    let gradeInput = inputs[2].value.trim().toUpperCase();

    if (!isNaN(gradeInput)) {
      const score = parseFloat(gradeInput);

      if (score < 0 || score > 100) {
        alert(`⚠️ Invalid score '${score}'. Score must be between 0 and 100.`);
        throw new Error("Invalid score");
      }

      gradeInput = scoreToGrade(score);
    }

    const grade = gradeInput;
    const point = gradeToPoint(grade);

    if (point === null) {
      alert(
        `⚠️ Invalid grade or score '${inputs[2].value.trim()}' detected. Please enter a valid score (0-100) or grade (A-F).`
      );
      return;
    }

    if (!isNaN(credit) && point !== null) {
      totalPoints += credit * point;
      totalCredits += credit;
    }
  });

  // Remove existing GPA display if it exists
  let existingGPA = document.getElementById(`${semester}-gpa`);
  if (existingGPA) existingGPA.remove();

  const gpaDisplay = document.createElement("p");
  gpaDisplay.id = `${semester}-gpa`;

  if (totalCredits === 0) {
    gpaDisplay.textContent = `⚠️ No valid data for ${semester}`;
    gpaDisplay.style.color = "red";
  } else {
    const gpa = (totalPoints / totalCredits).toFixed(2);
    gpaDisplay.textContent = `📘 GPA for ${semester}: ${gpa}`;
    gpaDisplay.style.color = "#1976d2";
  }

  table.parentElement.appendChild(gpaDisplay);
}

function calculateCGPA() {
  const tables = document.querySelectorAll(".input-table");
  let semesterData = {};
  let totalPoints = 0;
  let totalCredits = 0;

  tables.forEach((table) => {
    const semester = table.id;
    const rows = table.querySelectorAll("tbody tr");
    let semPoints = 0;
    let semCredits = 0;

    rows.forEach((row) => {
      const inputs = row.querySelectorAll("input");
      const credit = parseFloat(inputs[1].value);
      if (!isNaN(gradeInput)) {
        const score = parseFloat(gradeInput);
        gradeInput = scoreToGrade(score);
      }

      const grade = gradeInput;
      const point = gradeToPoint(grade);

      if (!isNaN(credit) && point !== null) {
        semPoints += credit * point;
        semCredits += credit;
      }
    });

    if (semCredits > 0) {
      const gpa = (semPoints / semCredits).toFixed(2);
      semesterData[semester] = { gpa, points: semPoints, credits: semCredits };
      totalPoints += semPoints;
      totalCredits += semCredits;

      // Display GPA below the semester table
      const gpaId = `${semester}-gpa`;
      let gpaDisplay = document.getElementById(gpaId);
      if (!gpaDisplay) {
        gpaDisplay = document.createElement("p");
        gpaDisplay.id = gpaId;
        table.parentElement.appendChild(gpaDisplay);
      }
      gpaDisplay.textContent = `📘 GPA for ${semester}: ${gpa}`;
      gpaDisplay.style.color = "#1976d2";
    }
  });

  const resultDiv = document.getElementById("cgpa-result");

  if (totalCredits === 0) {
    resultDiv.textContent = "⚠️ No valid grades entered.";
    resultDiv.style.color = "red";
    return;
  }

  const cgpa = (totalPoints / totalCredits).toFixed(2);
  let message = `🎓 CGPA: ${cgpa}`;
  let color = "#24633c";

  const numericCGPA = parseFloat(cgpa);

  if (numericCGPA >= 4.5) {
    message += " – First Class 🎉";
    color = "green";
  } else if (numericCGPA >= 3.5) {
    message += " – Second Class Upper 👍";
    color = "blue";
  } else if (numericCGPA >= 2.5) {
    message += " – Second Class Lower 👌";
    color = "orange";
  } else if (numericCGPA >= 1.5) {
    message += " – Third Class ⚠️";
    color = "tomato";
  } else {
    message += " – Probation 🚨";
    color = "darkred";
  }

  resultDiv.textContent = message;
  resultDiv.style.color = color;

  //Draw line chart
  const labels = Object.keys(semesterData);
  const data = labels.map((sem) => semesterData[sem].gpa);

  drawLineChart(labels, data);
}

let gpaChart; // to store the chart instance

function drawLineChart(labels, data) {
  const ctx = document.getElementById("gpaChart").getContext("2d");

  // destroy existing chart if it exists
  if (gpaChart) gpaChart.destroy();

  gpaChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "GPA Progress",
          data: data,
          fill: false,
          borderColor: "#24633c",
          backgroundColor: "#24633c",
          tension: 0.3,
          pointRadius: 5,
          pointHoverRadius: 7,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: {
          suggestedMin: 0,
          suggestedMax: 5,
          title: {
            display: true,
            text: "GPA",
          },
        },
        x: {
          title: {
            display: true,
            text: "Semester",
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
      },
    },
  });
}
