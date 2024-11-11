'use client';
import { NEW_MESSAGE_ALERT } from '@/constants/events';
import { useAppDispatch } from '@/hooks/redux-hook';
import { socketsHook } from '@/hooks/socket-hook';
import { setId } from '@/redux/reducers/chats';
import { clearCount, setCount } from '@/redux/reducers/message';
import { clearUsers } from '@/redux/reducers/search-result';
import { RootState } from '@/redux/store';
import { getSocket } from '@/socket';
import axios from 'axios';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { IoMdAddCircle } from 'react-icons/io';
import { useSelector } from 'react-redux';
import Search from './Search';
import { PiNutFill } from 'react-icons/pi';

type User = {
  _id: string;
  avatar: string;
  name: string;
  bio: string;
  members: [
    {
      _id: string
    }
  ]
};

const Chats = () => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState();
  const [peoples, setPeoples] = useState<User[]>([]);

  const users = useSelector((state: RootState) => state.search.users);
  const messages = useSelector((state: RootState) => state.message.notification);
  const user = useSelector((state: RootState) => state.auth);

  const socket = getSocket();

  const messageAlert = useCallback((data: any) => {
    dispatch(setCount(data.chatId));
    setCurrent(data.sender)
  }, [dispatch]);

  const events = {
    [NEW_MESSAGE_ALERT]: messageAlert,
  };

  socketsHook(socket, events);

  const handleChat = (id: string) => {
    dispatch(setId(id));
    dispatch(clearCount(id))
  };

  const addFriend = async (userId: string) => {
    setLoading(true);
    try {
      const result = await axios.put(
        `http://localhost:3000/user/addFriend?userId=${userId}`,
        {},
        { withCredentials: true }
      );
      toast.success(result.data.data);
      dispatch(clearUsers());
    } catch (error: any) {
      toast.error(error?.response?.data.message || "Failed to add friend");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await axios.get('http://localhost:3000/chat/me', { withCredentials: true });
        console.log(response.data.data);
        setPeoples(response.data.data);
      } catch (error) {
        console.error("Failed to load chats:", error);
      }
    };
    fetchChats();
  }, []);

  return (
    <div>
      <Search />
      <div className="mt-10 flex flex-col gap-8 overflow-hidden">
        {loading ? (
          <div className="loader-container flex justify-center items-center h-[500px]">
            <div className="loader"></div>
          </div>
        ) : (
          <div className="z-20 h-[500px] overflow-scroll flex flex-col gap-5">
            {users.length > 0 ? (
              users.map((user) => (
                <div key={user._id} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Image src={user.avatar} alt="Chat" width={40} height={40} className="rounded-full" />
                    <h1 className="font-semibold text-md">{user.name}</h1>
                  </div>
                  <button
                    onClick={() => addFriend(user._id)}
                    className="p-1.5 px-3.5 flex items-center gap-2 rounded-lg bg-purple-600 text-white font-semibold"
                  >
                    <h1>Add</h1>
                    <IoMdAddCircle />
                  </button>
                </div>
              ))
            ) : peoples.length > 0 ? (
              <div className="flex flex-col gap-5 pl-2">
                {peoples.map((person) => (
                  <div
                    onClick={() => handleChat(person._id)}
                    key={person._id}
                    className="flex items-center gap-6 hover:bg-gray-100 p-2"
                  >
                    <Image src={person.avatar[0]} alt="Chat" width={45} height={45} className="rounded-full aspect-square" />

                    <div className="flex flex-col">
                      <h1>{person.name}</h1>
                      <h1 className="text-sm opacity-70">{person.bio[0]}</h1>
                    </div>

                    {messages
                      .filter((message) => message.chatId === person._id)
                      .map((message, index) => {
                        const relevantMember = current !== user.user && message.count!=0

                        return relevantMember ? (
                          <div
                            key={`${index}`}
                            className="ml-auto h-6 w-6 bg-green-300 rounded-full flex justify-center items-center text-sm"
                          >
                            {message.count}
                          </div>
                        ) : null;
                      })}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500">No users available</div>
            )}
          </div>
        )}
      </div>
      <Toaster position="bottom-center" />
    </div>
  );
};

export default Chats;
