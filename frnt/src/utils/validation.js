export const validatePhone = (phone) => {
  if (!phone) return "Phone number is required";
  
  // Remove any spaces or special characters
  const cleanPhone = phone.replace(/[\s-]/g, '');
  
  // Strictly enforce +91 format with exactly 10 digits after
  const phoneRegex = /^\+91[0-9]{10}$/;
  if (!phoneRegex.test(cleanPhone)) {
    return "Phone number must start with +91 followed by 10 digits";
  }
  
  return "";
};

export const validateEmail = (email) => {
  if (!email) return "Email is required";
  
  // Basic email validation - allow more characters
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Please enter a valid email address";
  }
  
  return "";
};

export const validateName = (name) => {
  if (!name) return "Name is required";
  if (name.length < 2) return "Name must be at least 2 characters long";
  // Allow letters, spaces, and common name characters
  if (!/^[a-zA-Z\s'-]+$/.test(name)) {
    return "Name should only contain letters, spaces, hyphens and apostrophes";
  }
  return "";
};

export const validateMessage = (message) => {
  if (!message) return "";  // Message is optional
  if (message.length > 500) return "Message must not exceed 500 characters";
  return "";
};

export const validateDate = (date) => {
  if (!date) return "Date is required";
  const selectedDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  selectedDate.setHours(0, 0, 0, 0);
  
  if (selectedDate < today) return "Please select a future date";
  return "";
};

export const validateTime = (time) => {
  if (!time) return "Time is required";
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(time)) return "Invalid time format";
  
  const [hours] = time.split(':').map(Number);
  if (hours < 9 || hours > 17) return "Please select a time between 9 AM and 5 PM";
  return "";
};

export const validateService = (service) => {
  if (!service) return "Please select a service";
  return "";
};

export const validateVehicleDetails = (details) => {
  const errors = {};
  
  if (!details.model) {
    errors.model = "Vehicle model is required";
  }
  
  if (!details.year) {
    errors.year = "Vehicle year is required";
  } else {
    const year = parseInt(details.year);
    const currentYear = new Date().getFullYear();
    if (isNaN(year) || year < 1886 || year > currentYear) {
      errors.year = `Year must be between 1886 and ${currentYear}`;
    }
  }
  
  if (!details.registrationNumber) {
    errors.registrationNumber = "Registration number is required";
  } else if (!/^[A-Z0-9]+$/.test(details.registrationNumber)) {
    errors.registrationNumber = "Registration number should only contain uppercase letters and numbers";
  }
  
  return errors;
}; 