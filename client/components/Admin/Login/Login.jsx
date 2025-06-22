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
            const res = await Server.post('/admin/login', formData)
            if (res.data.admin) {
                localStorage.setItem('adminToken', res.data.admin)
                navigate.push('/admin/dashboard')
            } else {
                setError('Invalid email or password')
            }
        } catch (err) {
            setError('Login failed. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-brand-background to-gray-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full">
                <div className="card p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gradient mb-2">Admin Login</h1>
                        <p className="text-gray-600">Access your admin dashboard</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-lg">
                            <p className="text-error-700 text-sm">{error}</p>
                        </div>
                    )}

                    <form onSubmit={formHandle} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="input-field"
                                placeholder="Enter your email"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={passShow ? "text" : "password"}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    ref={passRef}
                                    className="input-field pr-12"
                                    placeholder="Enter your password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setPassShow(!passShow)
                                        passRef.current.type = passShow ? "password" : "text"
                                    }}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {passShow ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {isLoading ? (
                                <>
                                    <div className="spinner mr-2"></div>
                                    Signing in...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-500">
                            Secure admin access for authorized personnel only
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login