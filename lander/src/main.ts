// // === 1️⃣ Function to send data to your backend ===
// // 


//   document.addEventListener("DOMContentLoaded", () => {
//   const infoBox = document.getElementById("infoBox");
//   const buttons = document.querySelectorAll<HTMLElement>("#toggleFormButton, #csvLabel");

//   if (!infoBox) {
//     console.error("[DEBUG] ❌ infoBox not found.");
//     return;
//   }

//   console.log("[DEBUG] ✅ Tooltip system initialized.");

//   buttons.forEach((btn) => {
//     btn.addEventListener("mouseenter", () => {
//       const text = btn.getAttribute("data-info") || "⚠️ No data-info attribute found!";
//       console.log(`[DEBUG] Hovered on: ${btn.id || btn.tagName}, showing tooltip:`, text);

//       infoBox.textContent = text;
//       infoBox.classList.add("visible");

//       // Force visible for debugging even if CSS transition fails
//       infoBox.style.opacity = "1";
//       infoBox.style.display = "block";
//     });

//     btn.addEventListener("mouseleave", () => {
//       console.log(`[DEBUG] Left: ${btn.id || btn.tagName}, hiding tooltip.`);
//       infoBox.classList.remove("visible");

//       // Force reset
//       infoBox.style.opacity = "0";
//       infoBox.style.display = "none";
//     });
//   });
// });

// async function sendPredictionRequest(data: object) {
//   const output = document.getElementById("output");

//   console.group("🚀 API Debug: sendPredictionRequest");
//   console.log("Data being sent:", data);

//   try {
//     if (output) {
//       output.textContent = "⏳ Sending request to backend...";
//       output.style.color = "#999";
//     }

//     // Send POST request to your API
//     const response = await fetch("https://cobalt-90dg.onrender.com/predict", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(data),
//     });

//     // Check status
//     if (!response.ok) {
//       const errText = await response.text();
//       throw new Error(`HTTP ${response.status}: ${errText}`);
//     }

//     // Parse backend JSON
//     const result = await response.json();
//     console.log("✅ Backend response:", result);

//     if (output) {
//       output.textContent = "✅ Prediction Result:\n" + JSON.stringify(result, null, 2);
//       output.style.color = "green";
//     }

//   } catch (err) {
//     console.error("❌ Error communicating with backend:", err);

//     if (output) {
//       output.textContent = "❌ Error communicating with backend:\n" + err;
//       output.style.color = "red";
//     }
//   }

//   console.groupEnd();
// }



// document.addEventListener("DOMContentLoaded", () => {
//   const toggleFormButton = document.getElementById("toggleFormButton");
//   const formContainer = document.getElementById("formContainer");
//   const form = document.getElementById("dataForm") as HTMLFormElement | null;

//   console.log("Form variable:", form);
// form?.addEventListener("submit", () => console.log("Fired submit!"));

//   if (!toggleFormButton || !formContainer) {
//     console.error("Missing button or form container");
//     return;
//   }








//   // Toggle the visibility of the form
//   toggleFormButton.addEventListener("click", () => {
//     formContainer.classList.toggle("hidden");
//     console.log("Toggled hidden class:", formContainer.classList);
//   });

//   // Handle form submission
//   form?.addEventListener("submit", async (e) => {
//     e.preventDefault();

//     const data = {
//   inputs: [
//     parseFloat((document.getElementById("orbital_period") as HTMLInputElement).value) || 0,
//     parseFloat((document.getElementById("planet_radius") as HTMLInputElement).value) || 0,
//     parseFloat((document.getElementById("stellar_effective_temperature") as HTMLInputElement).value) || 0,
//     parseFloat((document.getElementById("stellar_radius") as HTMLInputElement).value) || 0,
//     parseFloat((document.getElementById("transit_depth") as HTMLInputElement).value) || 0,
//     parseFloat((document.getElementById("transit_duration") as HTMLInputElement).value) || 0,
//   ],
// };
//     const name_data = {
//       orbital_period: parseInt((document.getElementById("orbital_period") as HTMLInputElement).value) || 0,
//       planet_radius: parseInt((document.getElementById("planet_radius") as HTMLInputElement).value) || 0,
//       stellar_effective_temperature: parseInt((document.getElementById("stellar_effective_temperature") as HTMLInputElement).value) || 0,
//       stellar_radius: parseInt((document.getElementById("stellar_radius") as HTMLInputElement).value) || 0,
//       transit_depth: parseInt((document.getElementById("transit_depth") as HTMLInputElement).value) || 0,
//       transit_duration: parseInt((document.getElementById("transit_duration") as HTMLInputElement).value) || 0,
//     };

//     console.log("Generated JSON:", name_data);


//     await sendPredictionRequest(data);
//   });
// });

// const csvInput = document.getElementById("csvInput") as HTMLInputElement;
// const fileNameDisplay = document.getElementById("fileName") as HTMLElement;

// if (csvInput && fileNameDisplay) {
//   csvInput.addEventListener("change", (event) => {
//     const file = (event.target as HTMLInputElement).files?.[0];
//     fileNameDisplay.textContent = file ? file.name : "";
//   });
// }

document.getElementById("toggleFormButton")?.addEventListener("click", () => {
  window.location.href = "https://google.com"; // change this to your target URL
  console.log("Redirecting to Google")
});

