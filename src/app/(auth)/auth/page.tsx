'use client'
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import { userExists } from '@/redux/reducers/auth';
import axios from 'axios';
import { FiCamera } from 'react-icons/fi';
import {toast,Toaster} from 'react-hot-toast'
const useAppDispatch = () => useDispatch<AppDispatch>();

const LoginPage = () => {
    const dispatch = useAppDispatch();
    const router = useRouter();

    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [avatar, setAvatar] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
    
        try {
            let url = isLogin ? 'http://localhost:3000/user/login' : 'http://localhost:3000/user/new';
            let config = {};
            let data = {};
    
            if (isLogin) {
                data = {
                    username,
                    password,
                };
                config = {
                    withCredentials: true,
                    headers: { 'Content-Type': 'application/json' },
                };
            } else {
                const formData = new FormData();
                formData.append('username', username);
                formData.append('password', password);
                formData.append('name', name);
                formData.append('bio', bio);
                if (avatar) formData.append('avatar', avatar);
    
                data = formData;
                config = {
                    withCredentials: true,
                    headers: { 'Content-Type': 'multipart/form-data' },
                };
            }
    
            const response = await axios.post(url, data, config);
            
            const token = response.data.token;
            if (token) {
                // document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}`; 
                dispatch(userExists(true));
                router.push('/dashboard');
            } else {
                setError('No token received');
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data.message || 'Request failed');
                setError(error.response?.data.message || 'Request failed');
            } else {
                setError('An unexpected error occurred');
            }
        }
    };
    
    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatar(file);
            setAvatarPreview(URL.createObjectURL(file)); 
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-6 rounded-lg shadow-md w-96">
                <div className="flex justify-center mb-4 space-x-4">
                    <button
                        onClick={() => setIsLogin(true)}
                        className={`text-lg font-semibold ${isLogin ? 'text-blue-500' : 'text-gray-500'}`}
                    >
                        Login
                    </button>
                    <button
                        onClick={() => setIsLogin(false)}
                        className={`text-lg font-semibold ${!isLogin ? 'text-blue-500' : 'text-gray-500'}`}
                    >
                        Signup
                    </button>
                </div>
                <h1 className="text-2xl font-semibold mb-4 text-center">
                    {isLogin ? 'Login' : 'Signup'}
                </h1>
                <form onSubmit={handleSubmit}>
                    {!isLogin && (
                        <>
                            <div className="mb-4 flex justify-center">
                                <label htmlFor="avatarUpload" className="relative cursor-pointer">
                                    <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-300 bg-gray-200 flex items-center justify-center">
                                        {avatarPreview ? (
                                            <img src={avatarPreview} alt="Avatar" className="object-cover w-full h-full" />
                                        ) : (
                                            <FiCamera size={28} className="text-gray-500" />
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        id="avatarUpload"
                                        accept="image/*"
                                        onChange={handleAvatarChange}
                                        className="hidden"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-25 hover:bg-opacity-40 rounded-full transition">
                                        <FiCamera size={20} className="text-white opacity-80" />
                                    </div>
                                </label>
                            </div>
                            <div className="mb-4">
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="mt-1 block w-full p-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Bio</label>
                                <input
                                    type="text"
                                    id="bio"
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    className="mt-1 block w-full p-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
                                />
                            </div>
                        </>
                    )}
                    <div className="mb-4">
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="mt-1 block w-full p-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full p-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
                            required
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
                    >
                        {isLogin ? 'Login' : 'Signup'}
                    </button>
                </form>
            </div>
            <Toaster position="bottom-center" ></Toaster >
        </div>
    );
};

export default LoginPage;
