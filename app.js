import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { getDatabase, ref, set, get, child } from "firebase/database";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

import { jsPDF } from "https://cdn.skypack.dev/jspdf";

const firebaseConfig = {
  apiKey: "AIzaSyA-ZfLVt-mMYlewskoMF0xVdp7ODXykBMs",
  authDomain: "cgpa-master-calculator.firebaseapp.com",
  projectId: "cgpa-master-calculator",
  storageBucket: "cgpa-master-calculator.firebasestorage.app",
  messagingSenderId: "127347563364",
  appId: "1:127347563364:web:a5b7f218cffaf0401cf871",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
const db = getDatabase(app);

function signUpUser() {
  const name = document.getElementById("signup-name").value.trim();
  const matric = document
    .getElementById("signup-matric")
    .value.trim()
    .toUpperCase();
  const email = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value.trim();

  if (!name || !matric || !email || !password) {
    showMessage("Please fill all fields.", "error");
    return;
  }

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      const userDocRef = doc(firestore, "users", user.uid);

      return setDoc(userDocRef, {
        name: name,
        matric: matric,
        email: email,
      });
    })
    .then(() => {
      alert("Account created successfully!");
      window.location.href = "index.html";
    })
    .catch((error) => {
      console.error("Signup Error:", error);
      alert("Error: " + error.message);
    });
}

function loginUser() {
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value.trim();

  if (!email || !password) {
    showMessage("Please fill all fields.", "error");
    return;
  }

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      getUserData(user.uid).then((userData) => {
        if (userData) {
          const welcomeMessage = document.getElementById("welcome-message");
          if (welcomeMessage) {
            welcomeMessage.textContent = `Welcome, ${userData.name}!`;
          }
        }
      });
      showMessage("👋 Welcome back!", "success");
      window.location.href = "homePage.html";
    })
    .catch((error) => {
      showMessage("❌ Login failed: " + error.message, "error");
      console.error("Login Error:", error);
    });
}

async function getUserData(uid) {
  try {
    const userDocRef = doc(firestore, "users", uid);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      return userDocSnap.data();
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
}

function logoutUser() {
  signOut(auth)
    .then(() => {
      alert("🚪 Logged out successfully!");
      window.location.href = "index.html";
    })
    .catch((error) => {
      alert("❌ Error logging out: " + error.message);
      console.error("Logout Error:", error);
    });
}

function showMessage(message, type = "info") {
  const msgBox = document.getElementById("status-message");
  msgBox.textContent = message;
  msgBox.style.display = "block";

  if (type === "success") {
    msgBox.style.backgroundColor = "#d4edda";
    msgBox.style.color = "#155724";
    msgBox.style.border = "1px solid #c3e6cb";
    msgBox.style.width = "90%";
  } else if (type === "error") {
    msgBox.style.backgroundColor = "#f8d7da";
    msgBox.style.color = "#721c24";
    msgBox.style.border = "1px solid #f5c6cb";
    msgBox.style.width = "90%";
  } else {
    msgBox.style.backgroundColor = "#d1ecf1";
    msgBox.style.color = "#0c5460";
    msgBox.style.border = "1px solid #bee5eb";
    msgBox.style.width = "90%";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const signupButton = document.getElementById("signup-button");
  const loginButton = document.getElementById("login-button");
  const addSemesterBtn = document.getElementById("add-semester");
  const tablesContainer = document.getElementById("semester-tables");
  const calculateGpaBtn = document.getElementById("calculate-gpa");
  const logoutButton = document.getElementById("logout-button");
  const saveTranscriptBtn = document.getElementById("save-transcript-btn");

  if (signupButton) signupButton.addEventListener("click", signUpUser);
  if (loginButton) loginButton.addEventListener("click", loginUser);
  if (addSemesterBtn) addSemesterBtn.addEventListener("click", addSemester);
  if (calculateGpaBtn) calculateGpaBtn.addEventListener("click", calculateCGPA);
  if (logoutButton) logoutButton.addEventListener("click", logoutUser);
  if (saveTranscriptBtn)
    saveTranscriptBtn.addEventListener("click", saveAndPrintTranscript);

  tablesContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("add-course-btn")) {
      const semester = e.target.dataset.semester;
      addSemesterRow(semester);
    }

    if (e.target.classList.contains("calculate-gpa-btn")) {
      const semester = e.target.dataset.semester;
      calculateGPA(semester);
    }

    if (e.target.classList.contains("delete-btn")) {
      deleteRow(e.target);
    }
  });

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userDocRef = doc(firestore, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        const welcomeMessage = document.getElementById("welcome-message");
        if (welcomeMessage) {
          welcomeMessage.textContent = `Welcome, ${userData.name || ""}!`;
        }
      }

      loadUserDataFromFirestore();
    } else {
      window.location.href = "index.html";
    }
  });
});
//   const welcomeMessage = document.getElementById("welcome-message");
//   const user = auth.currentUser;

//   if (!user) {
//     welcomeMessage.textContent = "Welcome!";
//     return;
//   }

//   try {
//     const userDocRef = doc(firestore, "users", user.uid);
//     const userDocSnap = await getDoc(userDocRef);

//     if (userDocSnap.exists()) {
//       const userData = userDocSnap.data();
//       const name = userData.name || "User";
//       welcomeMessage.textContent = `Welcome, ${name}!`;
//     } else {
//       welcomeMessage.textContent = "Welcome!";
//     }
//   } catch (error) {
//     console.error("Error loading user name:", error);
//     welcomeMessage.textContent = "Welcome!";
//   }
// });

function deleteRow(button) {
  const row = button.closest("tr");
  if (row) {
    const table = row.closest("table");
    const semester = table.id;

    row.remove();

    deleteCourse(semester, row);
  }
}

async function deleteCourse(semester, row) {
  const user = auth.currentUser;
  if (!user) return;

  try {
    const userDocRef = doc(firestore, "users", user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      const semestersData = userData.semesters || {};
      const tableData = semestersData.tableData || {};

      if (tableData[semester]) {
        const inputs = row.querySelectorAll("input");
        const course = inputs[0].value.trim();
        const credit = inputs[1].value.trim();
        const grade = inputs[2].value.trim();

        tableData[semester] = tableData[semester].filter(
          (courseData) =>
            courseData.course !== course ||
            courseData.credit !== credit ||
            courseData.grade !== grade
        );

        await setDoc(userDocRef, { semesters: { tableData } }, { merge: true });
        console.log(`Course deleted from ${semester} in Firestore.`);

        calculateGPA(semester);
        calculateCGPA();
      }
    }
  } catch (error) {
    console.error("Error deleting course from Firestore:", error);
    alert("Error deleting course.");
  }
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
      <button class="btn add-course-btn" data-semester="${semester}">Add Course</button>
      <button class="btn calculate-gpa-btn" data-semester="${semester}">Calculate GPA</button>
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
      <td><button class="delete-btn">Delete</button></td>
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

  const existingMsg = document.getElementById(`${semester}-msg`);
  if (existingMsg) existingMsg.remove();

  let errorMessage = null;

  rows.forEach((row) => {
    const inputs = row.querySelectorAll("input");
    const credit = parseFloat(inputs[1].value);
    let gradeInput = inputs[2].value.trim().toUpperCase();

    if (!gradeInput || isNaN(credit)) return;

    if (!isNaN(gradeInput)) {
      const score = parseFloat(gradeInput);
      if (score < 0 || score > 100) {
        errorMessage = `⚠️ Invalid score '${score}' in ${semester}. Must be between 0 and 100.`;
        return;
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
    gpaDisplay.textContent = `⚠️ No valid data for ${semester}`;
    gpaDisplay.style.color = "red";
  } else {
    const gpa = (totalPoints / totalCredits).toFixed(2);
    gpaDisplay.textContent = `📘 GPA for ${semester}: ${gpa}`;
    gpaDisplay.style.color = "#1976d2";
  }

  if (errorMessage) {
    const msg = document.createElement("p");
    msg.id = `${semester}-msg`;
    msg.textContent = errorMessage;
    msg.style.color = "red";
    msg.style.marginTop = "5px";
    table.parentElement.appendChild(msg);
  }

  table.parentElement.appendChild(gpaDisplay);
}

function calculateCGPA() {
  const tables = document.querySelectorAll(".input-table");
  let semesterData = {};
  let totalPoints = 0;
  let totalCredits = 0;
  let tableData = {};

  tables.forEach((table) => {
    const semester = table.id;
    const rows = table.querySelectorAll("tbody tr");
    let semPoints = 0;
    let semCredits = 0;
    tableData[semester] = [];

    rows.forEach((row) => {
      const inputs = row.querySelectorAll("input");
      const course = inputs[0].value.trim();
      const credit = parseFloat(inputs[1].value);
      let gradeInput = inputs[2].value.trim().toUpperCase();

      if (!gradeInput) return;

      // If grade is a score, convert it to grade
      if (!isNaN(gradeInput)) {
        const score = parseFloat(gradeInput);
        if (score < 0 || score > 100) {
          alert(
            `⚠️ Invalid score '${score}'. Please enter a score between 0 and 100.`
          );
          return;
        }
        gradeInput = scoreToGrade(score);
      }

      const point = gradeToPoint(gradeInput);
      tableData[semester].push({
        course,
        credit: inputs[1].value,
        grade: inputs[2].value,
      });

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

  // Classify CGPA
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

  const labels = Object.keys(semesterData);
  const data = labels.map((sem) => semesterData[sem].gpa);
  drawLineChart(labels, data);

  saveUserDataToFirestore({
    tableData,
    semesterData,
    cgpaMessage: message,
    cgpaColor: color,
  });
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
          title: { display: true, text: "GPA" },
        },
        x: { title: { display: true, text: "Semester" } },
      },
      plugins: { legend: { display: false } },
    },
  });
}

async function saveUserDataToFirestore(data) {
  const user = auth.currentUser;
  if (!user) return;

  try {
    const userDocRef = doc(firestore, "users", user.uid);
    const semesters = Object.keys(data.tableData).map((semester) => ({
      name: semester,
      tableData: data.tableData[semester],
      gpa: data.semesterData[semester].gpa,
    }));

    // Sort semesters by name (assuming semester names are like "Semester 1", "Semester 2", etc.)
    semesters.sort((a, b) => a.name.localeCompare(b.name));

    await setDoc(
      userDocRef,
      {
        semesters: semesters,
        cgpaMessage: data.cgpaMessage,
        cgpaColor: data.cgpaColor,
      },
      { merge: true }
    );

    console.log("✅ Data saved successfully to Firestore.");
  } catch (error) {
    console.error("❌ Error saving data to Firestore:", error);
  }
}

async function loadUserDataFromFirestore() {
  const user = auth.currentUser;
  if (!user) return null;

  try {
    const userDocRef = doc(firestore, "users", user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      const semesters = userData.semesters || [];

      const tablesContainer = document.getElementById("semester-tables");
      if (tablesContainer) {
        tablesContainer.innerHTML = "";

        semesters.forEach((semester) => {
          const wrapper = document.createElement("div");
          wrapper.innerHTML = `
              <h3>${semester.name}</h3>
              <table id="${semester.name}" class="input-table">
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
              <button class="btn add-course-btn" data-semester="${semester.name}">Add Course</button>
              <button class="btn calculate-gpa-btn" data-semester="${semester.name}">Calculate GPA</button>
            `;
          tablesContainer.appendChild(wrapper);

          const table = document.getElementById(semester.name);
          if (table) {
            const tbody = table.querySelector("tbody");

            semester.tableData.forEach((courseData) => {
              const row = document.createElement("tr");
              row.innerHTML = `
                  <td><input type="text" value="${courseData.course}" /></td>
                  <td><input type="number" value="${courseData.credit}" /></td>
                  <td><input type="text" value="${courseData.grade}" /></td>
                  <td><button class="delete-btn">Delete</button></td>
                `;
              tbody.appendChild(row);
            });

            // Display GPA for the semester
            const gpaDisplay = document.createElement("p");
            gpaDisplay.id = `${semester.name}-gpa`;
            gpaDisplay.textContent = `📘 GPA for ${semester.name}: ${semester.gpa}`;
            gpaDisplay.style.color = "#1976d2";
            wrapper.appendChild(gpaDisplay);
          }
        });

        // Show CGPA
        if (userData.cgpaMessage && userData.cgpaColor) {
          const resultDiv = document.getElementById("cgpa-result");
          if (resultDiv) {
            resultDiv.textContent = userData.cgpaMessage;
            resultDiv.style.color = userData.cgpaColor;
          }
        }

        // Redraw the chart
        const labels = semesters.map((sem) => sem.name);
        const data = semesters.map((sem) => sem.gpa);
        drawLineChart(labels, data);
      }

      return userData;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error loading user data:", error);
    return null;
  }
}

async function saveAndPrintTranscript() {
  const exportContent = document.createElement("div");

  const user = auth.currentUser;
  if (user) {
    const userDocRef = doc(firestore, "users", user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();

      // Add Name and Matric Number
      const userInfo = document.createElement("div");
      userInfo.innerHTML = `
        <h2>CGPA Master Report</h2>
        <p><strong>Name:</strong> ${userData.name}</p>
        <p><strong>Matric Number:</strong> ${userData.matric}</p>
      `;
      userInfo.style.paddingBottom = "20px";

      exportContent.appendChild(userInfo);
    }
  }

  const tables = document.getElementById("semester-tables")?.cloneNode(true);
  const cgpaResult = document.getElementById("cgpa-result")?.cloneNode(true);

  exportContent.appendChild(tables);
  exportContent.appendChild(cgpaResult);

  // exportContent.style.padding = "20px";
  exportContent.classList.remove("container");
  exportContent.style.margin = "0px";
  exportContent.style.fontFamily = "Arial, sans-serif";
  // exportContent.style.width = "40%";

  const opt = {
    margin: 0.5,
    filename: "CGPA_Report.pdf",
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: "in", format: "a4", orientation: "landscape" },
  };

  html2pdf().set(opt).from(exportContent).save();
}

window.addSemesterRow = addSemesterRow;
window.deleteRow = deleteRow;
window.calculateGPA = calculateGPA;
window.calculateCGPA = calculateCGPA;
window.deleteCourse = deleteCourse;
