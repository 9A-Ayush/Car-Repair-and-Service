// Success response
export const successResponse = (res, message, data = null, statusCode = 200) => {
    const response = {
        success: true,
        message,
        timestamp: new Date().toISOString()
    };

    if (data) {
        response.data = data;
    }

    return res.status(statusCode).json(response);
};

// Error response
export const errorResponse = (res, message, statusCode = 400, errors = null) => {
    const response = {
        success: false,
        message,
        timestamp: new Date().toISOString(),
        code: statusCode
    };

    if (errors) {
        response.errors = errors;
    }

    // Log client errors for monitoring
    if (statusCode >= 400 && statusCode < 500) {
        console.warn(`Client Error (${statusCode}):`, message);
    }

    return res.status(statusCode).json(response);
};

// Internal server error response
export const serverError = (res, error) => {
    const isDev = process.env.NODE_ENV === 'development';
    const errorMessage = isDev ? error.message : 'An unexpected error occurred. Please try again later.';
    
    // Log the full error in development, just the message in production
    if (isDev) {
        console.error('Server Error:', error);
    } else {
        console.error('Server Error:', error.message);
    }

    return res.status(500).json({
        success: false,
        message: errorMessage,
        timestamp: new Date().toISOString(),
        code: 500,
        ...(isDev && {
            stack: error.stack,
            type: error.name
        })
    });
};
