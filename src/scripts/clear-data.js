// Script to clear localStorage data for plantoes app

// Function to clear all app data
function clearAppData() {
  // Clear plantoes data
  localStorage.removeItem('plantoes');
  
  // Clear locais data
  localStorage.removeItem('locais');
  
  console.log('✅ All app data has been cleared successfully!');
  console.log('🔄 Please refresh the app to see the changes.');
}

// Execute the function
clearAppData();
