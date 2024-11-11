'use client';
import { userExists, userNotExists } from '@/redux/reducers/auth';
import { on } from '@/redux/reducers/notification';
import type { AppDispatch, RootState } from "@/redux/store";
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { BiLogOut } from 'react-icons/bi';
import { FaUserFriends } from 'react-icons/fa';
import { IoIosNotifications } from 'react-icons/io';
import { LuMessageSquare } from 'react-icons/lu';
import { MdGroups2 } from 'react-icons/md';
import { useDispatch, useSelector } from "react-redux";
// Custom hook for typed dispatch
const useAppDispatch = () => useDispatch<AppDispatch>();

const MyProfile = () => {
    
    const dispatch = useAppDispatch();
    const router = useRouter();
    const [one,setOne] = useState(false)
    const handleNotify = ()=> {
        setOne(!one)
        dispatch(on(one))
    }

    const handleLogout = async()=> {
        try {
            const response = await axios.get('http://localhost:3000/user/logout', { withCredentials: true });
            toast.success(response.data.message);
            console.log(response.data.message)
             
            setTimeout(()=>router.push('/auth'),500)
            setTimeout(()=>dispatch(userNotExists()),1500)
            
        } catch (error) {
            toast.error('Error logging out');
        }
    }
    const fetchProfile = async () => {
        try {
            const response = await axios.get('http://localhost:3000/user/me', { withCredentials: true });
            dispatch(userExists(response.data.data._id));
            return response.data.data;
        } catch (error) {
            dispatch(userNotExists());
        }
    };

    const { data, error, isLoading } = useQuery({
        queryKey: ['my'],
        queryFn: fetchProfile,
    });

    if (isLoading) {
        return <div className="text-center p-5">Loading...</div>;
    }

    if (error instanceof Error) {
        return <div className="text-center p-5 text-red-500">An error occurred: {error.message}</div>;
    }

    return (
        <div className="flex flex-col gap-7 p-8 max-w-4xl mx-auto overflow-hidden">
            {/* Profile Section */}
            <div className="flex flex-col items-center rounded-lg p-6">
            <div className="relative w-28 h-28 rounded-full overflow-hidden bg-gray-300 border-4 border-purple-600">
                    {data?.avatar?.url && (
                        <Image
                            src={data.avatar.url}
                            alt="Profile Avatar"
                            fill
                            className="object-cover object-center"
                        />
                    )}
                </div>
                <div className="mt-4 text-center">
                    <h1 className="text-xl font-semibold text-gray-800">
                        {data?.name ? data.name.charAt(0).toUpperCase() + data.name.slice(1) : 'User Name'}
                    </h1>

                    {/* <p className="text-gray-600">{data?.bio || 'User Bio'}</p> */}
                    <p className="text-gray-600 w-[230px]">'I am cool boy with zero attitude. Call me.</p>
                    <button className="mt-3 px-6 py-2 bg-purple-500 font-semibold text-white rounded-md hover:bg-purple-600 transition-all">
                        Edit Profile
                    </button>
                </div>
            </div>

            {/* Navigation Links */}
            <div className="flex flex-col gap-4 w-[200px] mx-auto pl-8">
                <div className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 transition-all cursor-pointer">
                    <LuMessageSquare size={21}  />
                    <span className="text-md font-medium">Messages</span>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 transition-all cursor-pointer">
                    <MdGroups2 size={21}  />
                    <span className="text-md font-medium">Groups</span>
                </div>
                <div onClick={handleNotify} className="flex items-center rounded-md gap-3 p-1.5  hover:bg-gray-100 transition-all cursor-pointer">
                    <IoIosNotifications size={21} />
                    <span className="text-md font-medium">Notifications</span>
                </div>
                <div className="flex items-center gap-3 p-1.5 rounded-md hover:bg-gray-100 transition-all cursor-pointer">
                    <FaUserFriends size={21}  />
                    <span className="text-md font-medium">Friends</span>
                </div>
                <div onClick={handleLogout} className="flex items-center gap-3 p-1 rounded-md hover:bg-gray-100 transition-all cursor-pointer">
                    <BiLogOut size={22} />
                    <span className="text-md font-medium">Logout</span>
                </div>
            </div>
            <Toaster position='bottom-center' />
        </div>
    );
};

export default MyProfile;
