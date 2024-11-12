'use client';
import { NEW_ATTACHMENTS, NEW_MESSAGE, START_TYPING, STOP_TYPING } from '@/constants/events';
import { useAppDispatch } from '@/hooks/redux-hook';
import { socketsHook } from '@/hooks/socket-hook';
import { clearId } from '@/redux/reducers/chats';
import { clearCount } from '@/redux/reducers/message';
import { off } from '@/redux/reducers/notification';
import { RootState } from '@/redux/store';
import { getSocket } from '@/socket';
import axios from 'axios';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { AiFillAudio } from 'react-icons/ai';
import { FaCheck, FaLongArrowAltLeft, FaPaperPlane, FaRegFileAlt, FaRegImage } from 'react-icons/fa';
import { ImAttachment } from 'react-icons/im';
import { IoIosVideocam, IoMdCall, IoMdVideocam } from 'react-icons/io';
import { IoSearchSharp } from 'react-icons/io5';
import { MdDelete, MdOutlineCancel } from 'react-icons/md';
import { useSelector } from 'react-redux';

interface Notification {
    _id: string;
    sender: {
        _id: string;
        avatar: string;
        name: string;
    };
}

interface Chats {
    _id: string;
    attachments?: [
        {
            public_id: string,
            url: string
        }
    ]
    chat: string;
    content: string;
    createdAt: Date;
    sender: {
        _id: string;
        avatar: {
            public_id: string;
            url: string;
        };
        name?: string;
    };
}

interface Avatar {
    _id: string;
    avatar: string;
    name: string;
}

const Page = () => {
    const startTimeoutRef = useRef<any>(null);
    const clearTimeoutRef = useRef<any>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const res = useSelector((state: RootState) => state.notify);
    const user = useSelector((state: RootState) => state.auth);
    const [images, setImages] = useState([])
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [chats, setChats] = useState<Chats[] | undefined>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [typing, setTyping] = useState<boolean>(false);
    const [avatar, setAvatar] = useState<Avatar[]>([]);
    const [chatLoading, setChatLoading] = useState<boolean>(false);
    const [message, setMessage] = useState<string>('');
    const [file, setFile] = useState<boolean>(false);
    const [members, setMembers] = useState([]);
    const dispatch = useAppDispatch();
    const id = useSelector((state: RootState) => state.chat.id);

    const formatTime = (date: Date) => {
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const hour12 = hours % 12 || 12;
        const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
        return `${hour12}:${formattedMinutes} ${ampm}`;
    };

    const handleFilePopup = () => {
        setFile(!file)
    }

    useEffect(() => {
        if (id && id.length > 1) {
            dispatch(clearCount(id))
        }
    }, [id, chats])

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:3000/user/notifications`, { withCredentials: true });
            setNotifications(response.data.data);
            setChats([]);
            dispatch(clearId());
        } catch (error) {
            console.error('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

    const func = useCallback((data: any) => {
        setChats((prev) => [...prev, data.message])
    }, [])

    const attachmentHandler = useCallback((data: any) => {
        setChats((prev) => [...prev, data.message])
    }, [])

    const startTyping = useCallback((data: any) => {
        console.log('true')
        setTyping(true)
    }, [])

    const stopTyping = useCallback((data: any) => {
        console.log(data)
        console.log('false')
        setTyping(false)
    }, [])

    const socket = getSocket();
    const eventHandlers = {
        [NEW_MESSAGE]: func,
        [NEW_ATTACHMENTS]: attachmentHandler,
        [START_TYPING]: startTyping,
        [STOP_TYPING]: stopTyping
    }

    let clear: any;
    let start: any;

    // useEffect(()=>{

    // })
    const handleInput = (e: any) => {
        // Clear previous timeouts
        clearTimeout(startTimeoutRef.current);
        clearTimeout(clearTimeoutRef.current);
      
        // Set new timeouts using useRef
        startTimeoutRef.current = setTimeout(() => {
          socket.emit(START_TYPING, { members, chatId: id });
        },100);
      
        setMessage(e.target.value);
      
        clearTimeoutRef.current = setTimeout(() => {
          socket.emit(STOP_TYPING, { members, chatId: id });
        }, 2000);
      };
    const handleBlur = () => {
        socket.emit(STOP_TYPING, { members, chatId: id });
    };

    socketsHook(socket, eventHandlers);

    useEffect(() => {
        fetchNotifications();
    }, [res.notification]);


    useEffect(() => {
        const handleChat = async () => {
            if (id && id.length > 1) {
                setChatLoading(true);
                try {
                    const result = await axios.get(`http://localhost:3000/chat/getmessages/${id}`, { withCredentials: true });
                    setChats(result.data.data);
                } catch (error) {
                    console.error("Failed to load chat messages:", error);
                } finally {
                    setChatLoading(false);
                }
            }
        };

        const fetchParticularChat = async () => {
            try {
                const d = await axios.get(`http://localhost:3000/chat/${id}?populate=true`, { withCredentials: true });
                setAvatar(d.data.data.members);
                setMembers(d.data.data.members);
            } catch (e) {
                toast.error('Something went wrong');
            }
        };

        handleChat();
        fetchParticularChat();

    }, [id]);

    const handleReq = async (accept: boolean, requestId: string) => {
        try {
            await axios.put(`http://localhost:3000/user/accept`, { accept, requestId }, { withCredentials: true });
            fetchNotifications();
        } catch (error) {
            console.error("Failed to handle friend request:", error);
        }
    };

    const handleSendMessage = async () => {
        if (!message) return;
        socket.emit(NEW_MESSAGE, { chatId: id, members, message });
        setMessage('');
    };

    if (loading || chatLoading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    const fn = () => {
        const name = members?.find((member) => member._id !== user.user)?.name;
        return !res.notification && name;
    };

    const name = fn();

    const fn2 = () => {
        const ava = avatar.find((a) => a._id !== user.user);
        return ava;
    };

    const ava = fn2();

    const back = () => {
        setChats([]); // Clear the chats
        dispatch(clearId()); // Dispatch the clearId action
    }

    type FileType = 'image' | 'audio' | 'file' | 'video';

    const handleClick = (type: FileType) => {
        if (fileInputRef.current) {
            if (type === 'image') {
                fileInputRef.current.accept = 'image/*';
            } else if (type === 'audio') {
                fileInputRef.current.accept = 'audio/*';
            } else if (type === 'video') {
                fileInputRef.current.accept = 'video/*';
            } else {
                fileInputRef.current.accept = '*/*';
            }

            // Trigger the file input click
            fileInputRef.current.click();
        }
    };


    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const fileList = event.target.files;

        if (!fileList || fileList.length === 0) {
            console.warn('No files selected');
            return;
        }

        const filesArray = Array.from(fileList);
        setImages(filesArray);
        console.log('Selected files:', filesArray);

        const uploadFormData = new FormData();
        filesArray.forEach((file) => {
            uploadFormData.append('files', file);
        });

        try {
            const response = await axios.post(`http://localhost:3000/chat/attachment/${id}`, uploadFormData, {
                withCredentials: true,
            });
            if (response.data) {
                toast.success('File sent successfully');
            }
        } catch (e) {
            const errorMessage = e?.response?.data?.message || 'An error occurred while sending the file';
            toast.error(errorMessage);
            console.error('File upload error:', e);
        }
    };


    return (
        <div className={`flex justify-center items-center mt-12 overflow-hidden w-full ${file ? '' : ''}`}>
            {res.notification && (
                <div className="flex flex-col bg-pink-200 relative h-auto w-[600px] shadow-md rounded-lg bg-white left-1/2 -translate-x-1/2">
                    <MdOutlineCancel onClick={() => dispatch(off())} className="absolute right-2 top-2 cursor-pointer" color="white" />
                    <h1 className="text-md p-3 rounded-t-lg flex items-center justify-center font-semibold bg-purple-600 text-white">My Notifications</h1>
                    <hr />
                    {notifications.length > 0 ? (
                        notifications.map((notification) => (
                            <div key={notification._id} className="flex flex-row justify-between items-center gap-3 mt-3 p-1 px-4 mb-3">
                                <div className="flex flex-row items-center gap-3">
                                    <Image src={notification.sender.avatar} alt="Avatar" height={40} width={40} className="rounded-full aspect-square" />
                                    <h1 className="text-black text-md">{notification.sender.name}</h1>

                                </div>
                                <div className="flex flex-row items-center gap-4">
                                    <button onClick={() => handleReq(true, notification._id)} className="hover:scale-110">
                                        <FaCheck color="green" size={20} />
                                    </button>
                                    <button onClick={() => handleReq(false, notification._id)} className="hover:scale-110">
                                        <MdDelete color="red" size={20} />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-4 text-center text-gray-500">No notifications available</div>
                    )}
                </div>
            )}
            <div className="rounded-lg text-gray-700 w-full h-[600px] flex flex-col">
                <div className={`flex flex-row justify-between text-xl font-semibold w-[752px] px-6 py-5 fixed bg-purple-800 text-white ${name && ava ? 'block' : 'hidden'}`}>
                    <div className='text-xl font-semibold flex items-center gap-3'>
                        <FaLongArrowAltLeft className='cursor-pointer' onClick={back} />
                        {ava?.avatar ? <Image src={ava?.avatar} alt="Avatar" height={36} width={36} className="rounded-full aspect-square" /> : ''}
                        <div className='flex flex-col h-9'>
                        <h1 className='text-xl font-semibold mb-1'>{name}</h1>
                                                    <p className="text-xs">
                                                        {typing && (
                                                            <span className="flex">
                                                                Typing
                                                                <span className="ml-1 text-white">
                                                                    <span className="dot dot1 text-md">.</span>
                                                                    <span className="dot dot2">.</span>
                                                                    <span className="dot dot3">.</span>
                                                                </span>
                                                            </span>
                                                        )}

                                                        {/* Custom CSS */}
                                                        <style jsx>{`
                                @keyframes blink1 {
                                0%, 100% {
                                    opacity: 0;
                                }
                                50% {
                                    opacity: 1;
                                }
                                }

                                @keyframes blink2 {
                                0%, 100% {
                                    opacity: 0;
                                }
                                50% {
                                    opacity: 1;
                                }
                                }

                                @keyframes blink3 {
                                0%, 100% {
                                    opacity: 0;
                                }
                                50% {
                                    opacity: 1;
                                }
                                }

                                .dot {
                                opacity: 0;
                                animation-timing-function: ease-in-out;
                                }

                                .dot1 {
                                animation: blink1 1.5s infinite;
                                }

                                .dot2 {
                                animation: blink2 1.5s infinite 0.5s; /* delay for the second dot */
                                }

                                .dot3 {
                                animation: blink3 1.5s infinite 1s; /* delay for the third dot */
                                }
                            `}</style>
                                </p>
                            </div>

                    </div>
                    <div className='flex flex-row items-center gap-5'>
                        <IoMdCall size={23} />
                        <IoMdVideocam size={23} />
                        <IoSearchSharp size={23} />
                    </div>
                </div>



                {chats && !res.notification ? (
                    <div className="flex flex-col h-full overflow-y-scroll scrollbar-hide mt-16 px-8">
                        {chats.map((chat) => {
                            const isCurrentUser = chat?.sender?._id.toString() === user.user;

                            return (
                                <div
                                    key={chat._id}
                                    className={
                                        isCurrentUser
                                            ? "flex flex-row justify-end items-center gap-4 mt-3 py-2 px-4 bg-purple-300 font-semibold max-w-[40%] ml-auto rounded-tl-xl rounded-br-xl"
                                            : "flex flex-row items-center gap-5 mt-3 py-2 px-4 rounded-tl-xl bg-white rounded-br-xl max-w-[37%] justify-start"
                                    }
                                >
                                    {isCurrentUser ? (
                                        <>
                                            <h1 className="text-xs mt-auto opacity-90 mr-auto">
                                                {formatTime(new Date(chat.createdAt))}
                                            </h1>
                                            <h1 className="text-black text-sm w-[43%]">{chat.content}</h1>
                                            <div className="flex flex-col gap-2">
                                                {chat.attachments &&
                                                    chat.attachments.map((attachment) => (
                                                        <Image
                                                            key={attachment.public_id}
                                                            src={attachment?.url}
                                                            alt="Attachment"
                                                            height={600}
                                                            width={600}
                                                            className=""
                                                        />
                                                    ))}
                                            </div>
                                            <Image
                                                src={chat.sender.avatar.url}
                                                alt="Avatar"
                                                height={35}
                                                width={35}
                                                className="rounded-full aspect-square"
                                            />
                                        </>
                                    ) : (
                                        <>
                                            <Image
                                                src={chat.sender.avatar.url}
                                                alt="Avatar"
                                                height={35}
                                                width={35}
                                                className="rounded-full aspect-square"
                                            />
                                            <h1 className="text-black text-sm w-[43%]">{chat.content}</h1>
                                            <div className="flex flex-col gap-2">
                                                {chat.attachments &&
                                                    chat.attachments.map((attachment) => (
                                                        <Image
                                                            key={attachment.public_id}
                                                            src={attachment?.url}
                                                            alt="Attachment"
                                                            height={1000}
                                                            width={1000}
                                                            className=""
                                                        />
                                                    ))}
                                            </div>
                                            <h1 className="text-xs mt-auto opacity-90">
                                                {formatTime(new Date(chat.createdAt))}
                                            </h1>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div
                        className={`flex justify-center items-center flex-1 text-center text-gray-500 ${res.notification ? 'hidden' : 'block'
                            }`}
                    >
                        No chats available
                    </div>
                )}

                <div className={`relative w-full flex px-8 ${res.notification ? 'hidden' : 'block'}`}>
                    {
                        file
                        &&
                        <>
                            <input
                                type="file"
                                multiple
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                style={{ display: 'none' }} // Hide the input field
                            />

                            <div className='h-40 absolute bottom-[50px] w-[140px] bg-white text-black shadow-md rounded-sm flex flex-col gap-1 justify-center'>
                                <div
                                    onClick={() => handleClick('image')}
                                    className='flex flex-row gap-3 items-center py-1 hover:bg-gray-100 px-5 cursor-pointer'
                                >
                                    <FaRegImage />
                                    <h1>Image</h1>
                                </div>
                                <div
                                    onClick={() => handleClick('audio')}
                                    className='flex flex-row gap-3 items-center py-1 hover:bg-gray-100 px-5 cursor-pointer'
                                >
                                    <AiFillAudio />
                                    <h1>Audio</h1>
                                </div>
                                <div
                                    onClick={() => handleClick('file')}
                                    className='flex flex-row gap-3 items-center py-1 hover:bg-gray-100 px-5 cursor-pointer'
                                >
                                    <FaRegFileAlt />
                                    <h1>File</h1>
                                </div>
                                <div
                                    onClick={() => handleClick('video')}
                                    className='flex flex-row gap-3 items-center py-1 hover:bg-gray-100 px-5 cursor-pointer'
                                >
                                    <IoIosVideocam />
                                    <h1>Video</h1>
                                </div>
                            </div>
                        </>
                    }
                    <div className="relative w-[680px] flex justify-center items-center mt-4 relative">
                        <ImAttachment onClick={handleFilePopup} className=' absolute left-3 text-black cursor-pointer' size={18} />
                        <input
                            type="text"
                            onBlur={handleBlur}
                            placeholder="Enter your message..."
                            className="px-11 py-2 mr-1 border-2 border-gray-300 rounded-md w-[1000px]"
                            value={message}
                            onChange={handleInput}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        />
                        <button onClick={handleSendMessage} className="ml-2 px-4 py-2 bg-purple-600 text-white rounded-md">
                            <FaPaperPlane size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Page;
