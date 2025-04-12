import axios from 'axios'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useParams, useNavigate } from 'react-router-dom'

export const ResetPassword = () => {
    const token = useParams().token
    const { register, handleSubmit, formState: { errors } } = useForm()
    const navigate = useNavigate()
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [loading, setLoading] = useState(false)

    const submitHandler = async (data) => {
        try {
            setLoading(true)
            setError('')
            setSuccess('')
            
            const obj = {
                token: token,
                password: data.password
            }
            
            const res = await axios.post(
                `${import.meta.env.VITE_SERVER_URL}/user/resetpassword`, 
                obj
            )
            
            setSuccess('Password reset successfully!')
            setTimeout(() => navigate("/login"), 2000)
        } catch (err) {
            setError(err.response?.data?.message || 'Password reset failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md">
                <h1 className="text-2xl font-semibold text-center mb-6 text-gray-800">
                    Reset Password
                </h1>
                {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                {success && <p className="text-green-500 text-center mb-4">{success}</p>}
                <form onSubmit={handleSubmit(submitHandler)} className="space-y-6">
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">
                            New Password
                        </label>
                        <input
                            type="password"
                            {...register("password", { 
                                required: 'Password is required',
                                minLength: {
                                    value: 6,
                                    message: 'Password must be at least 6 characters'
                                }
                            })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                            placeholder="Enter new password"
                        />
                        {errors.password && (
                            <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                        )}
                    </div>
                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition duration-200 ${loading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                            {loading ? 'Processing...' : 'Reset Password'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}