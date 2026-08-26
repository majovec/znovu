document.addEventListener("DOMContentLoaded", () => {
  const { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    onAuthStateChanged, 
    signOut, 
    collection, 
    addDoc, 
    query, 
    where, 
    onSnapshot 
  } = window.fbMethods;

  const auth = window.auth;
  const db = window.db;

  // Elements
  const authCard = document.getElementById("authCard");
  const appCard = document.getElementById("appCard");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const btnLogin = document.getElementById("btnLogin");
  const btnRegister = document.getElementById("btnRegister");
  const btnLogout = document.getElementById("btnLogout");
  const authError = document.getElementById("authError");

  const exerciseName = document.getElementById("exerciseName");
  const weightInput = document.getElementById("weight");
  const repsInput = document.getElementById("reps");
  const btnAddWorkout = document.getElementById("btnAddWorkout");
  const workoutList = document.getElementById("workoutList");

  let currentUser = null;
  let unsubscribeWorkouts = null;

  // Auth State Observer
  onAuthStateChanged(auth, (user) => {
    if (user) {
      currentUser = user;
      authCard.classList.add("hidden");
      appCard.classList.remove("hidden");
      loadWorkouts();
    } else {
      currentUser = null;
      if (unsubscribeWorkouts) unsubscribeWorkouts();
      authCard.classList.remove("hidden");
      appCard.classList.add("hidden");
    }
  });

  // Login
  btnLogin.addEventListener("click", async () => {
    authError.classList.add("hidden");
    try {
      await signInWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
    } catch (err) {
      authError.textContent = "Chyba při přihlášení: " + err.message;
      authError.classList.remove("hidden");
    }
  });

  // Register
  btnRegister.addEventListener("click", async () => {
    authError.classList.add("hidden");
    try {
      await createUserWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
    } catch (err) {
      authError.textContent = "Chyba při registraci: " + err.message;
      authError.classList.remove("hidden");
    }
  });

  // Logout
  btnLogout.addEventListener("click", () => {
    signOut(auth);
  });

  // Add Workout
  btnAddWorkout.addEventListener("click", async () => {
    if (!exerciseName.value || !weightInput.value || !repsInput.value) return;

    try {
      await addDoc(collection(db, "workouts"), {
        userId: currentUser.uid,
        exercise: exerciseName.value,
        weight: Number(weightInput.value),
        reps: Number(repsInput.value),
        createdAt: new Date().toISOString()
      });

      exerciseName.value = "";
      weightInput.value = "";
      repsInput.value = "";
    } catch (err) {
      console.error("Chyba při ukládání: ", err);
    }
  });

  // Load Workouts Realtime
  function loadWorkouts() {
    const q = query(collection(db, "workouts"), where("userId", "==", currentUser.uid));
    
    unsubscribeWorkouts = onSnapshot(q, (snapshot) => {
      workoutList.innerHTML = "";
      snapshot.forEach((doc) => {
        const data = doc.data();
        const li = document.createElement("li");
        li.className = "workout-item";
        li.innerHTML = `
          <div>
            <strong>${data.exercise}</strong>
            <div style="font-size: 0.85rem; color: #64748b;">${data.weight} kg × ${data.reps} opakování</div>
          </div>
        `;
        workoutList.appendChild(li);
      });
    });
  }
});
