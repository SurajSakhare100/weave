import { Eye, EyeOff } from 'lucide-react'
import Server from '@/Config/Server'
import { useRouter } from 'next/router'
import React, { useRef, useState } from 'react'

function Login() {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const passRef = useRef()
    const [passShow, setPassShow] = useState(false)

    const navigate = useRouter()

    const formHandle = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')

        try {
            const res = await Server.post('/auth/admin/login', formData)
            if (res.data.success) {
                // Cookie is automatically set by the server
                navigate.push('/admin/dashboard')
            } else {
                setError('Invalid email or password')
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen admin-bg-secondary flex items-center justify-center px-4">
            <div className="max-w-md w-full">
                <div className="admin-card p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold admin-text-primary mb-2">Admin Login</h1>
                        <p className="admin-text-secondary">Access your admin dashboard</p>
                    </div>

                    {error && (
                        <div className="mb-6 admin-alert admin-alert-danger">
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    <form onSubmit={formHandle} className="space-y-6">
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

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full admin-btn admin-btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <div className="admin-spinner mr-2"></div>
                                    Signing in...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm admin-text-tertiary">
                            Secure admin access for authorized personnel only
                        </p>
                        <p className="text-sm admin-text-tertiary mt-2">
                            Need an admin account?{' '}
                            <button
                                onClick={() => navigate.push('/admin/register')}
                                className="admin-text-primary hover:admin-text-important font-medium"
                            >
                                Register here
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login