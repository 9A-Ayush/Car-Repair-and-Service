import Appointment from '../models/Appointment.js';
import User from '../models/User.js';
import { successResponse, errorResponse, serverError } from '../utils/response.js';
import { sendBookingEmail } from '../utils/notifications.js';

// Create new appointment
export const createAppointment = async (req, res) => {
    try {
        console.log('Received appointment request:', req.body);
        console.log('User from token:', req.user);
        console.log('Headers:', req.headers);
        
        // Allow appointments without authentication
        const userId = req.user?._id || null;
        
        const { service, date, time, vehicleDetails, customerName, email, phoneNumber, message } = req.body;
        
        // Validate required fields
        if (!service || !date || !time || !vehicleDetails) {
            console.error('Missing required fields:', { service, date, time, vehicleDetails });
            return errorResponse(res, 'Service, date, time and vehicle details are required');
        }

        // Validate vehicle details
        if (!vehicleDetails.model || !vehicleDetails.year || !vehicleDetails.registrationNumber) {
            console.error('Missing vehicle details:', vehicleDetails);
            return errorResponse(res, 'Vehicle model, year and registration number are required');
        }
        
        // Log parsed vehicle details
        console.log('Vehicle details received:', vehicleDetails);

        // Validate and format vehicle details
        if (!vehicleDetails || typeof vehicleDetails !== 'object') {
            console.error('Invalid vehicle details:', vehicleDetails);
            return errorResponse(res, 'Invalid vehicle details format');
        }

        // Ensure required vehicle fields
        const { model, year, registrationNumber } = vehicleDetails;
        if (!model || !year || !registrationNumber) {
            console.error('Missing required vehicle fields');
            return errorResponse(res, 'Vehicle model, year, and registration number are required');
        }

        // Format vehicle details
        const formattedVehicleDetails = {
            make: vehicleDetails.make || 'Not Specified',
            model: model.trim(),
            year: year.toString().trim(),
            registrationNumber: registrationNumber.toString().trim().toUpperCase()
        };

        // Create appointment data
        const appointmentData = {
            service,
            date,
            time,
            vehicleDetails: formattedVehicleDetails,
            status: 'pending',
            notes: message || '',
            userId: userId,
            customerName: customerName.trim(),
            customerEmail: email.trim(),
            customerPhone: phoneNumber.replace(/[\s-]/g, '')
        };
        
        console.log('Processed appointment data:', appointmentData);

        console.log('Creating appointment with data:', appointmentData);

        try {
            // Create new appointment
            const appointment = new Appointment(appointmentData);
            await appointment.save();
            console.log('Appointment saved successfully:', appointment);

            // Generate a booking reference
            const bookingRef = `BOK-${Date.now().toString().substring(7)}`;
            appointment.bookingRef = bookingRef;
            await appointment.save();
            console.log('Added booking reference:', bookingRef);

            // Send confirmation email
            try {
                await sendBookingEmail(appointmentData.customerEmail, {
                    name: appointmentData.customerName,
                    service: appointmentData.service,
                    date: appointmentData.date,
                    time: appointmentData.time,
                    vehicleDetails: `${formattedVehicleDetails.make} ${formattedVehicleDetails.model} (${formattedVehicleDetails.year}) - ${formattedVehicleDetails.registrationNumber}`,
                    bookingRef: bookingRef,
                    status: appointmentData.status
                });
                console.log('Confirmation email sent');
            } catch (emailError) {
                console.error('Error sending confirmation email:', emailError);
                // Continue with the response even if email fails
            }

            return successResponse(res, 'Appointment booked successfully', appointment);
        } catch (dbError) {
            console.error('Database error:', dbError);
            return errorResponse(res, 'Failed to save appointment. Please try again.');
        }
        if (appointmentData.customerEmail) {
            try {
                console.log('Sending confirmation email to:', appointmentData.customerEmail);
                await sendBookingEmail(appointmentData.customerEmail, {
                    name: appointmentData.customerName,
                    service,
                    date,
                    time,
                    vehicleDetails: appointmentData.vehicleDetails,
                    bookingRef,
                    status: 'pending'
                });
                console.log('Confirmation email sent successfully');
            } catch (emailError) {
                console.error('Error sending confirmation email:', emailError);
                // Continue even if email fails
            }
        }

        return successResponse(res, 'Appointment created successfully', { 
            appointment,
            bookingRef
        });
    } catch (error) {
        console.error('Error creating appointment:', error);
        return serverError(res, error);
    }
};

// Get all appointments (admin only)
export const getAllAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find()
            .populate('userId', 'name email')
            .sort({ date: -1, time: -1 });
        
        successResponse(res, 'All appointments retrieved successfully', { appointments });
    } catch (error) {
        serverError(res, error);
    }
};

// Get user's appointments
export const getUserAppointments = async (req, res) => {
  try {
    console.log('Fetching appointments for user:', req.user._id);
    const appointments = await Appointment.find({ userId: req.user._id })
      .sort({ date: -1 });
    
    console.log('Found appointments:', appointments.length);
    
    // Return appointments in the format expected by frontend
    return res.status(200).json({
      success: true,
      appointments: appointments.map(apt => ({
        _id: apt._id,
        service: apt.service,
        date: apt.date,
        time: apt.time,
        status: apt.status,
        vehicleDetails: apt.vehicleDetails,
        notes: apt.notes,
        bookingRef: apt.bookingRef
      }))
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    serverError(res, error);
  }
};

// Get appointment by ID
export const getAppointmentById = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id)
            .populate('userId', 'name email');
        
        if (!appointment) {
            return errorResponse(res, 'Appointment not found');
        }

        successResponse(res, 'Appointment retrieved successfully', { appointment });
    } catch (error) {
        serverError(res, error);
    }
};

// Update appointment status
export const updateAppointmentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const appointment = await Appointment.findById(id).populate('userId', 'email');
        if (!appointment) {
            return errorResponse(res, 'Appointment not found');
        }

        // Update status
        appointment.status = status;
        await appointment.save();

        // Send status update email if user has email
        if (appointment.userId && appointment.userId.email) {
            await sendBookingEmail(appointment.userId.email, {
                service: appointment.service,
                date: appointment.date,
                time: appointment.time,
                vehicleDetails: appointment.vehicleDetails,
                status: status
            });
        }

        successResponse(res, 'Appointment status updated successfully', { appointment });
    } catch (error) {
        serverError(res, error);
    }
};

// Update appointment details
export const updateAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const appointment = await Appointment.findById(id);
        if (!appointment) {
            return errorResponse(res, 'Appointment not found');
        }

        // Check if user owns the appointment or is admin
        if (appointment.userId.toString() !== req.user.id && req.user.role !== 'admin') {
            return errorResponse(res, 'Not authorized to update this appointment');
        }

        // Update allowed fields
        const allowedUpdates = ['service', 'date', 'time', 'vehicleDetails', 'status'];
        Object.keys(updates).forEach(update => {
            if (allowedUpdates.includes(update)) {
                appointment[update] = updates[update];
            }
        });

        await appointment.save();

        // Get user email for sending update notification
        const user = await User.findById(appointment.userId);
        
        if (user && user.email) {
            // Send update email
            await sendBookingEmail(user.email, {
                service: appointment.service,
                date: appointment.date,
                time: appointment.time,
                vehicleDetails: appointment.vehicleDetails,
                status: appointment.status
            });
        }

        successResponse(res, 'Appointment updated successfully', { appointment });
    } catch (error) {
        serverError(res, error);
    }
};

// Delete appointment
export const deleteAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        
        const appointment = await Appointment.findById(id);
        if (!appointment) {
            return errorResponse(res, 'Appointment not found');
        }

        // Check if user owns the appointment or is admin
        if (appointment.userId.toString() !== req.user.id && req.user.role !== 'admin') {
            return errorResponse(res, 'Not authorized to delete this appointment');
        }

        // Get user email before deleting
        const user = await User.findById(appointment.userId);
        
        // Store appointment details for email
        const appointmentDetails = {
            service: appointment.service,
            date: appointment.date,
            time: appointment.time,
            vehicleDetails: appointment.vehicleDetails,
            status: 'cancelled'
        };

        // Delete the appointment
        await appointment.deleteOne();

        // Send cancellation email if user has email
        if (user && user.email) {
            await sendBookingEmail(user.email, appointmentDetails);
        }

        successResponse(res, 'Appointment deleted successfully');
    } catch (error) {
        serverError(res, error);
    }
};

// Create appointment from chatbot (works for both logged-in and anonymous users)
export const createChatbotAppointment = async (req, res) => {
    try {
        const { customerName, email, phoneNumber, service, date, time, message, userId, vehicleDetails } = req.body;
        
        if (!service || !date || !time) {
            return errorResponse(res, 'Service, date and time are required');
        }

        // Create appointment data
        const appointmentData = {
            service,
            date,
            time,
            vehicleDetails: typeof vehicleDetails === 'string' ? vehicleDetails : JSON.stringify(vehicleDetails),
            status: 'pending',
            customerName: customerName || 'Anonymous',
            customerEmail: email,
            customerPhone: phoneNumber,
            notes: message || ''
        };

        // If userId is provided and valid, associate with user
        if (userId && userId !== 'anonymous') {
            try {
                const user = await User.findById(userId);
                if (user) {
                    appointmentData.userId = userId;
                }
            } catch (err) {
                console.error('Error finding user:', err);
                // Continue without user association if there's an error
            }
        }

        // Create the appointment
        const appointment = await Appointment.create(appointmentData);

        // Generate a booking reference
        const bookingRef = `BOK-${Date.now().toString().substring(7)}`;
        appointment.bookingRef = bookingRef;
        await appointment.save();

        // Send confirmation email if email is provided
        if (email) {
            try {
                await sendBookingEmail(email, {
                    name: customerName || 'Valued Customer',
                    service,
                    date,
                    time,
                    vehicleDetails: vehicleDetails,
                    bookingRef,
                    status: 'pending'
                });
            } catch (emailError) {
                console.error('Error sending confirmation email:', emailError);
                // Continue even if email fails
            }
        }

        successResponse(res, 'Appointment created successfully', { 
            appointment,
            bookingRef
        });
    } catch (error) {
        console.error('Error creating appointment:', error);
        serverError(res, error);
    }
};

// Get appointment statistics (admin only)
export const getAppointmentStats = async (req, res) => {
    try {
        const stats = await Appointment.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const totalAppointments = await Appointment.countDocuments();
        const todayAppointments = await Appointment.countDocuments({
            date: {
                $gte: new Date(new Date().setHours(0, 0, 0)),
                $lt: new Date(new Date().setHours(23, 59, 59))
            }
        });

        successResponse(res, 'Appointment statistics retrieved successfully', {
            byStatus: stats,
            total: totalAppointments,
            today: todayAppointments
        });
    } catch (error) {
        serverError(res, error);
    }
};
