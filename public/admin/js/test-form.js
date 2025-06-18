// Simple test script to check form submission
document.addEventListener('DOMContentLoaded', function() {
  const menuForm = document.getElementById('menu-form');
  
  if (menuForm) {
    menuForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const formData = new FormData(menuForm);
      const data = {};
      
      for (let [key, value] of formData.entries()) {
        data[key] = value;
      }
      
      console.log('Form data:', data);
      alert('Form data collected: ' + JSON.stringify(data));
    });
  }
});