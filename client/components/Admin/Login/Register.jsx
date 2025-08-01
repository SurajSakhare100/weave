import { Eye, EyeOff } from 'lucide-react'
import Server from '@/Config/Server'
import { useRouter } from 'next/router'
import React, { useRef, useState } from 'react'

function Register() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    })
    
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const passRef = useRef()
    const confirmPassRef = useRef()
    const [passShow, setPassShow] = useState(false)
    const [confirmPassShow, setConfirmPassShow] = useState(false)

    const navigate = useRouter()

    const formHandle = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')
        setSuccess('')

        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match')
            setIsLoading(false)
            return
        }

        // Validate password strength
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long')
            setIsLoading(false)
            return
        }

        try {
            const res = await Server.post('/auth/admin/register', {
                name: formData.name,
                email: formData.email,
                password: formData.password
            })
            
            if (res.data.success) {
                setSuccess('Admin account created successfully! Redirecting to dashboard...')
                setTimeout(() => {
                    navigate.push('/admin/dashboard')
                }, 2000)
            } else {
                setError('Registration failed. Please try again.')
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen admin-bg-secondary flex items-center justify-center px-4">
            <div className="max-w-md w-full">
                <div className="admin-card p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold admin-text-primary mb-2">Admin Registration</h1>
                        <p className="admin-text-secondary">Create a new admin account</p>
                    </div>

                    {error && (
                        <div className="mb-6 admin-alert admin-alert-danger">
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="mb-6 admin-alert admin-alert-success">
                            <p className="text-sm">{success}</p>
                        </div>
                    )}

                    <form onSubmit={formHandle} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium admin-text-secondary mb-2">
                                Full Name
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="admin-input"
                                placeholder="Enter your full name"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium admin-text-secondary mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="admin-input"
                                placeholder="Enter your email"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium admin-text-secondary mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={passShow ? "text" : "password"}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    ref={passRef}
                                    className="admin-input pr-12"
                                    placeholder="Enter your password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setPassShow(!passShow)
                                        passRef.current.type = passShow ? "password" : "text"
                                    }}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 admin-text-tertiary hover:admin-text-secondary transition-colors"
                                >
                                    {passShow ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium admin-text-secondary mb-2">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <input
                                    type={confirmPassShow ? "text" : "password"}
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    ref={confirmPassRef}
                                    className="admin-input pr-12"
                                    placeholder="Confirm your password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setConfirmPassShow(!confirmPassShow)
                                        confirmPassRef.current.type = confirmPassShow ? "password" : "text"
                                    }}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 admin-text-tertiary hover:admin-text-secondary transition-colors"
                                >
                                    {confirmPassShow ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full admin-btn admin-btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <div className="admin-spinner mr-2"></div>
                                    Creating Account...
                                </>
                            ) : (
                                'Create Admin Account'
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm admin-text-tertiary">
                            Already have an account?{' '}
                            <button
                                onClick={() => navigate.push('/admin/login')}
                                className="admin-text-primary hover:admin-text-important font-medium"
                            >
                                Sign In
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Register 