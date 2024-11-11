'use client'
import { useAppDispatch } from '@/hooks/redux-hook';
import { addUsers, clearUsers } from '@/redux/reducers/search-result';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { IoSearch } from 'react-icons/io5';

type Users = {
   _id: string,
   avatar: string,
   name: string
};

const Search = () => {
  const dispatch = useAppDispatch();
  const [search, setSearch] = useState<string>('');
  const [users, setUsers] = useState<Users[]>([]);

  useEffect(() => {
    if (!search.trim()) {
      setUsers([]);
      dispatch(clearUsers());
      return;
    }

    const fetchData = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/user/search?keyword=${search}`, { withCredentials: true });
        dispatch(addUsers(res.data.data));
        setUsers(res.data.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    const timeoutId = setTimeout(fetchData, 1000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [search, dispatch]);

  return (
    <div className="relative w-full">
      <IoSearch 
        size={21} 
        className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400"
      />
      
      <input 
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        type="text" 
        placeholder="Search for users" 
        className="w-full pl-10 pr-3 py-3 rounded-md focus:outline-none focus:border-blue-500 bg-purple-200 rounded-xl placeholder:font-semibold"
      />
    </div>
  );
};

export default Search;