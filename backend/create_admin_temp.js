const axios = require('axios');

const createAdmin = async () => {
    try {
        const response = await axios.post('http://localhost:5000/api/admin/register', {
            name: 'Ayush',
            email: 'ayushkanha19@gamil.com',
            phoneNumber: '9479280486',
            password: 'password123',
            position: 'Manager'
        });
        console.log('Admin created successfully:', response.data);
    } catch (error) {
        if (error.response) {
            console.error('Error creating admin:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
};

createAdmin();
