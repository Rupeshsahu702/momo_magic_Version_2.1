import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [view, setView] = useState('login'); // 'login' | 'forgot-password'
    const [resetStep, setResetStep] = useState('phone'); // 'phone' | 'otp-reset'
    const [resetFormData, setResetFormData] = useState({
        phoneNumber: '',
        otp: '',
        newPassword: ''
    });
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { email, password } = formData;
    const { login, admin } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (admin) {
            navigate('/admin');
        }
    }, [admin, navigate]);

    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    const onResetChange = (e) => {
        setResetFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await login({ email, password });
            navigate('/admin');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setIsLoading(true);
        try {
            const response = await fetch('/api/admin/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ phoneNumber: resetFormData.phoneNumber }),
            });
            const data = await response.json();

            if (response.ok) {
                setSuccessMessage(data.message);
                setResetStep('otp-reset');
            } else {
                setError(data.message || 'Failed to send OTP');
            }
        } catch (err) {
            setError(err.message || 'Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setIsLoading(true);
        try {
            const response = await fetch('/api/admin/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(resetFormData),
            });
            const data = await response.json();

            if (response.ok) {
                setSuccessMessage(data.message);
                setTimeout(() => {
                    setView('login');
                    setResetStep('phone');
                    setSuccessMessage('');
                    setResetFormData({ phoneNumber: '', otp: '', newPassword: '' });
                }, 3000);
            } else {
                setError(data.message || 'Failed to reset password');
            }
        } catch (err) {
            setError(err.message || 'Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    if (view === 'forgot-password') {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100">
                <div className="px-8 py-6 mt-4 text-left bg-white shadow-lg rounded-lg w-full max-w-md">
                    <h3 className="text-2xl font-bold text-center">Reset Password</h3>
                    {error && <div className="mt-2 p-2 bg-red-100 border border-red-400 text-red-700 rounded text-sm text-center">{error}</div>}
                    {successMessage && <div className="mt-2 p-2 bg-green-100 border border-green-400 text-green-700 rounded text-sm text-center">{successMessage}</div>}

                    {resetStep === 'phone' ? (
                        <form onSubmit={handleSendOTP}>
                            <div className="mt-4">
                                <label className="block text-gray-700">Phone Number</label>
                                <input
                                    type="text"
                                    placeholder="Enter registered phone number"
                                    name="phoneNumber"
                                    value={resetFormData.phoneNumber}
                                    onChange={onResetChange}
                                    className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full px-6 py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-900 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {isLoading ? 'Sending...' : 'Send OTP'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleResetPassword}>
                            <div className="mt-4">
                                <div className="text-sm text-gray-600 mb-4 text-center">
                                    OTP sent to {resetFormData.phoneNumber}
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700">Enter OTP</label>
                                    <input
                                        type="text"
                                        placeholder="Enter 6-digit OTP"
                                        name="otp"
                                        value={resetFormData.otp}
                                        onChange={onResetChange}
                                        className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700">New Password</label>
                                    <input
                                        type="password"
                                        placeholder="New Password"
                                        name="newPassword"
                                        value={resetFormData.newPassword}
                                        onChange={onResetChange}
                                        className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                                        required
                                        minLength="6"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full px-6 py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-900 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {isLoading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </form>
                    )}

                    <div className="mt-6 text-center">
                        <button
                            onClick={() => {
                                setView('login');
                                setError('');
                                setSuccessMessage('');
                                setResetStep('phone');
                            }}
                            className="text-sm text-blue-600 hover:underline"
                        >
                            Back to Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <div className="px-8 py-6 mt-4 text-left bg-white shadow-lg rounded-lg w-full max-w-sm">
                <h3 className="text-2xl font-bold text-center">Admin Login</h3>
                {error && <div className="mt-2 p-2 bg-red-100 border border-red-400 text-red-700 rounded text-sm text-center">{error}</div>}
                {successMessage && <div className="mt-2 p-2 bg-green-100 border border-green-400 text-green-700 rounded text-sm text-center">{successMessage}</div>}
                <form onSubmit={onSubmit}>
                    <div className="mt-4">
                        <label className="block text-gray-700">Email</label>
                        <input
                            type="email"
                            placeholder="Email"
                            name="email"
                            value={email}
                            onChange={onChange}
                            className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                            required
                        />
                    </div>
                    <div className="mt-4">
                        <label className="block text-gray-700">Password</label>
                        <input
                            type="password"
                            placeholder="Password"
                            name="password"
                            value={password}
                            onChange={onChange}
                            className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                            required
                        />
                    </div>
                    <div className="flex items-center justify-between mt-4">
                        <button className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-900">Login</button>
                        <button
                            type="button"
                            onClick={() => {
                                setView('forgot-password');
                                setError('');
                                setSuccessMessage('');
                            }}
                            className="text-sm text-blue-600 hover:underline"
                        >
                            Forgot Password?
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
