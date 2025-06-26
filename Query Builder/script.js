document.addEventListener("DOMContentLoaded", function () {
  let currentOpenBox = null;

  // Handle toggle sections
  document.querySelectorAll(".toggle-section").forEach((section) => {
    section.addEventListener("click", function (e) {
      // Jangan proses jika klik berasal dari checkbox
      if (e.target.closest('input[type="checkbox"]')) {
        return;
      }

      const targetId = this.getAttribute("data-target");
      const targetBox = document.getElementById(targetId);
      const chevron = this.querySelector(".chevron i");

      if (!targetBox) return;

      // Close currently open box if it's different
      if (currentOpenBox && currentOpenBox !== targetBox) {
        closeBox(currentOpenBox);
      }

      // Toggle current box
      targetBox.classList.toggle("show");

      // Update chevron icon
      if (targetBox.classList.contains("show")) {
        chevron.classList.replace("fa-chevron-down", "fa-chevron-up");
        currentOpenBox = targetBox;
      } else {
        chevron.classList.replace("fa-chevron-up", "fa-chevron-down");
        currentOpenBox = null;
      }
    });
  });
  // Close boxes when clicking outside
  document.addEventListener("click", function (e) {
    if (
      !e.target.closest(".toggle-section") &&
      !e.target.closest(".scroll-box") &&
      currentOpenBox
    ) {
      closeBox(currentOpenBox);
      currentOpenBox = null;
    }
  });

  function closeBox(box) {
    box.classList.remove("show");
    const chevron = document.querySelector(
      `[data-target="${box.id}"] .chevron i`
    );
    if (chevron) {
      chevron.classList.replace("fa-chevron-up", "fa-chevron-down");
    }
  }

  // Animate accordion items on load
  document.querySelectorAll(".accordion-item").forEach((item, index) => {
    item.style.opacity = "0";
    item.style.transform = "translateY(20px)";
    item.style.transition = "opacity 0.5s ease, transform 0.5s ease";

    setTimeout(() => {
      item.style.opacity = "1";
      item.style.transform = "translateY(0)";
    }, 100 * index);
  });

  // Hover effect on generate button
  const generateBtn = document.getElementById("generateQueryBtn");
  if (generateBtn) {
    generateBtn.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-3px)";
    });

    generateBtn.addEventListener("mouseleave", function () {
      this.style.transform = "translateY(0)";
    });
  }

  // Generate query
  generateBtn.addEventListener("click", function () {
    if (uploadedIds.length === 0) {
      alert("Please upload an Excel file with at least one ID");
      return;
    }

    const selectedIdentifier = identifierType.value;
    const filters = {
      identifier_type: selectedIdentifier,
      identifiers: uploadedIds,
    };

    console.log("Query Parameters:", filters);

    this.innerHTML = '<i class="fas fa-check me-2"></i>Query Generated!';
    this.classList.add("btn-success");
    setTimeout(() => {
      this.innerHTML = '<i class="fas fa-bolt me-2"></i>Generate Query';
      this.classList.remove("btn-success");
    }, 2000);
  });
});
