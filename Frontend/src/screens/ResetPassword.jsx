import axios from 'axios'
import React from 'react'
import { useForm } from 'react-hook-form'
import { useParams ,useNavigate } from 'react-router-dom'

export const ResetPassword = () => {
    const token = useParams().token
    const { register, handleSubmit } = useForm()
    const navigate = useNavigate()
    const submitHandler = async (data) => {
        //resetpasseord api..
        const obj = {
            token: token,
            password: data.password
        }
        const res = await axios.post("http://localhost:3000/user/resetpassword", obj)
        console.log(res.data)
        navigate("/login")
        
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md">
                <h1 className="text-2xl font-semibold text-center mb-6 text-gray-800">
                    Reset Password
                </h1>
                <form onSubmit={handleSubmit(submitHandler)} className="space-y-6">
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">
                            New Password
                        </label>
                        <input
                            type="text"
                            {...register("password")}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                            placeholder="Enter new password"
                        />
                    </div>
                    <div>
                        <input
                            type="submit"
                            value="Reset Password"
                            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition duration-200 cursor-pointer"
                        />
                    </div>
                </form>
            </div>
        </div>
    )
}
